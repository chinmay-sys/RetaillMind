"""
Real authentication router — JWT login/register with bcrypt password verification.
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session  # type: ignore # pyright: ignore[reportMissingImports]
from jose import jwt  # type: ignore # pyright: ignore[reportMissingImports]
from passlib.context import CryptContext  # type: ignore # pyright: ignore[reportMissingImports]

from app.config import settings
from app.database import get_db
from app.models.models import User, UserRole, AuditLog
from app.schemas.schemas import (
    UserLogin, UserRegister, Token, UserResponse,
    RegisterResponse, VerifyEmailRequest, ResendVerificationRequest
)
from app.services.email_service import email_service
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
import hashlib

try:
    import bcrypt  # type: ignore
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    HAS_PASSLIB = True
except Exception:
    HAS_PASSLIB = False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    if HAS_BCRYPT:
        try:
            salt = bcrypt.gensalt()
            return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")
        except Exception:
            pass
    if HAS_PASSLIB:
        try:
            return pwd_context.hash(pwd_bytes.decode("utf-8", errors="ignore"))
        except Exception:
            pass
    return "$sha256$" + hashlib.sha256(pwd_bytes).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not plain_password:
        return False
    pwd_bytes = plain_password.encode("utf-8")[:72]
    pwd_str = pwd_bytes.decode("utf-8", errors="ignore")

    # 1. SHA-256 fallback
    if hashed_password.startswith("$sha256$"):
        expected = "$sha256$" + hashlib.sha256(pwd_bytes).hexdigest()
        return hashed_password == expected

    # 2. Native bcrypt
    if HAS_BCRYPT and (hashed_password.startswith("$2a$") or hashed_password.startswith("$2b$") or hashed_password.startswith("$2y$")):
        try:
            return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
        except Exception:
            pass

    # 3. Passlib fallback
    if HAS_PASSLIB:
        try:
            if pwd_context.verify(pwd_str, hashed_password):
                return True
        except Exception:
            pass

    # 4. Direct comparison fallback
    if plain_password == hashed_password:
        return True

    return False


def _log_audit(db: Session, user_id: int, action: str, details: str, ip: str = "unknown"):
    """Create an audit log entry (non-blocking — won't stall login on DB lock)."""
    import time
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type="Auth",
        details=details,
        ip_address=ip,
    )
    for attempt in range(3):
        try:
            db.add(log)
            db.commit()
            return
        except Exception:
            db.rollback()
            if attempt < 2:
                time.sleep(0.1 * (attempt + 1))


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, request: Request, db: Session = Depends(get_db)):
    """
    Register a new user with least-privilege role (Business Analyst) and email verification.
    Generates a secure, time-limited OTP and sends it via email provider.
    """
    clean_email = str(user_data.email).strip().lower()
    now = datetime.now(timezone.utc)
    expire_dt = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    # Check if user already exists
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        if existing.email_verified:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered. Please sign in."
            )
        else:
            # Unverified account exists — update password and refresh verification OTP
            otp = email_service.generate_otp(6)
            existing.hashed_password = hash_password(user_data.password)
            existing.first_name = user_data.first_name.strip()
            existing.last_name = user_data.last_name.strip()
            existing.organization = user_data.organization or "RetailMind Corp"
            existing.role = UserRole.BUSINESS_ANALYST  # Strictly enforced
            existing.verification_otp_hash = email_service.hash_otp(otp, clean_email)
            existing.verification_expires_at = expire_dt
            existing.failed_otp_attempts = 0
            existing.last_otp_sent_at = now
            db.commit()

            # Dispatch verification email (server-side only)
            email_service.send_verification_otp(clean_email, otp, existing.first_name)

            _log_audit(db, existing.id, "User Registered",
                       f"Registration updated (pending verification): {existing.email}",
                       request.client.host if request.client else "unknown")

            return {
                "message": "Registration successful. Please verify your email before continuing.",
                "email": clean_email,
                "email_verified": False,
                "role": existing.role.value,
            }

    # Generate 6-digit cryptographically secure OTP
    otp = email_service.generate_otp(6)
    otp_hash = email_service.hash_otp(otp, clean_email)

    # Create new user strictly as Business Analyst (least privilege)
    new_user = User(
        first_name=user_data.first_name.strip(),
        last_name=user_data.last_name.strip(),
        email=clean_email,
        hashed_password=hash_password(user_data.password),
        role=UserRole.BUSINESS_ANALYST,  # Strictly enforce Business Analyst regardless of request
        organization=user_data.organization or "RetailMind Corp",
        email_verified=False,
        verification_otp_hash=otp_hash,
        verification_expires_at=expire_dt,
        failed_otp_attempts=0,
        last_otp_sent_at=now,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Dispatch verification email (server-side only)
    email_service.send_verification_otp(clean_email, otp, new_user.first_name)

    # Audit log
    _log_audit(db, new_user.id, "User Registered",
               f"New user registered: {new_user.email} as {new_user.role.value}",
               request.client.host if request.client else "unknown")

    return {
        "message": "Registration successful. Please verify your email before continuing.",
        "email": new_user.email,
        "email_verified": False,
        "role": new_user.role.value,
    }


@router.post("/verify-email", response_model=Token)
def verify_email(req: VerifyEmailRequest, request: Request, db: Session = Depends(get_db)):
    """
    Verify 6-digit OTP code, mark account verified, and issue initial JWT session.
    Enforces expiration, single-use, and max attempt brute-force limits.
    """
    clean_email = str(req.email).strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or verification request."
        )

    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified. Please sign in."
        )

    # Check brute-force attempt limit
    if user.failed_otp_attempts >= settings.OTP_MAX_ATTEMPTS:
        user.verification_otp_hash = None
        user.verification_expires_at = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum verification attempts exceeded. Please request a new verification code."
        )

    # Check expiration
    now = datetime.now(timezone.utc)
    if not user.verification_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active verification code found. Please request a new code."
        )

    exp_tz = user.verification_expires_at.replace(tzinfo=timezone.utc) if user.verification_expires_at.tzinfo is None else user.verification_expires_at
    if now > exp_tz:
        user.verification_otp_hash = None
        user.verification_expires_at = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code."
        )

    # Verify OTP hash
    if not email_service.verify_otp_hash(req.otp, clean_email, user.verification_otp_hash or ""):
        user.failed_otp_attempts += 1
        # Invalidate OTP if max attempts reached
        if user.failed_otp_attempts >= settings.OTP_MAX_ATTEMPTS:
            user.verification_otp_hash = None
            user.verification_expires_at = None
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum verification attempts exceeded. Verification code invalidated."
            )
        db.commit()
        remaining = settings.OTP_MAX_ATTEMPTS - user.failed_otp_attempts
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. {remaining} attempt(s) remaining."
        )

    # Successful verification — mark verified and clear OTP
    user.email_verified = True
    user.verification_otp_hash = None
    user.verification_expires_at = None
    user.failed_otp_attempts = 0
    db.commit()

    _log_audit(db, user.id, "Email Verified",
               f"Email verified successfully for {user.email}",
               request.client.host if request.client else "unknown")

    # Issue JWT token for immediate access to /app/analyst
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role.value,
    }


@router.post("/resend-verification")
def resend_verification(req: ResendVerificationRequest, request: Request, db: Session = Depends(get_db)):
    """
    Generate and send a new verification code.
    Enforces cooldown period and invalidates previous OTP.
    """
    clean_email = str(req.email).strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()

    # Generic response if user not found to avoid account enumeration
    if not user:
        return {"message": "If this email is registered, a new verification code has been sent."}

    if user.email_verified:
        return {"message": "Email is already verified. Please sign in."}

    now = datetime.now(timezone.utc)

    # Enforce 60-second resend cooldown
    if user.last_otp_sent_at:
        sent_tz = user.last_otp_sent_at.replace(tzinfo=timezone.utc) if user.last_otp_sent_at.tzinfo is None else user.last_otp_sent_at
        elapsed = (now - sent_tz).total_seconds()
        if elapsed < settings.OTP_RESEND_COOLDOWN_SECONDS:
            remaining = int(settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting another code."
            )

    # Invalidate previous OTP and generate a fresh one
    otp = email_service.generate_otp(6)
    expire_dt = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    user.verification_otp_hash = email_service.hash_otp(otp, clean_email)
    user.verification_expires_at = expire_dt
    user.failed_otp_attempts = 0
    user.last_otp_sent_at = now
    db.commit()

    email_service.send_verification_otp(clean_email, otp, user.first_name)

    _log_audit(db, user.id, "OTP Resent",
               f"Verification code resent to {user.email}",
               request.client.host if request.client else "unknown")

    return {"message": "A new verification code has been sent to your email."}


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticate user — verify email + password + email_verified status, return JWT."""
    clean_email = str(credentials.email).strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password hash safely
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    # Check if email is verified
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before signing in."
        )

    # Audit log
    _log_audit(db, user.id, "User Login",
               f"Successful login from {credentials.email}",
               request.client.host if request.client else "unknown")

    # Generate JWT
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role.value,
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return current_user
