"""
Real authentication router — JWT login/register with bcrypt password verification.
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext

from app.config import settings
from app.database import get_db
from app.models.models import User, UserRole, AuditLog
from app.schemas.schemas import UserLogin, UserRegister, Token, UserResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _log_audit(db: Session, user_id: int, action: str, details: str, ip: str = "unknown"):
    """Create an audit log entry."""
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type="Auth",
        details=details,
        ip_address=ip,
    )
    db.add(log)
    db.commit()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, request: Request, db: Session = Depends(get_db)):
    """Register a new user — hash password, save to DB, return JWT."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Create user with hashed password
    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        hashed_password=pwd_context.hash(user_data.password),
        role=UserRole.RETAIL_MANAGER,  # Default role for new registrations
        organization=user_data.organization or "RetailMind Corp"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Audit log
    _log_audit(db, new_user.id, "User Registered",
               f"New user registered: {new_user.email}",
               request.client.host if request.client else "unknown")

    # Generate JWT
    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role.value})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "email": new_user.email,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "role": new_user.role.value,
    }


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticate user — verify email + bcrypt hash, return JWT."""
    # Look up user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password hash
    if not pwd_context.verify(credentials.password, user.hashed_password):
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
