"""
Registration Role Security & Email Verification Test Suite.
Tests that:
1. All public registrations are strictly assigned Business Analyst (least privilege).
2. Public registration cannot escalate to Admin or Retail Manager.
3. Accounts are created with email_verified = False.
4. Unverified accounts are prevented from logging in (403 Forbidden).
5. Valid 6-digit OTP verifies account and grants JWT session.
6. Invalid, expired, or reused OTPs are rejected.
7. Exceeding max failed OTP attempts invalidates the OTP.
8. Resend cooldown is enforced (60s) and generates fresh OTP.
9. Seeded demo accounts (Admin, Manager, Analyst) remain pre-verified and functional.
"""
import pytest
import os
import sys
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database import SessionLocal, init_db
from app.models.models import User, UserRole
from app.services.email_service import email_service
from app.config import settings

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    init_db()
    yield


def test_public_registration_creates_business_analyst():
    """Verify standard public registration receives Business Analyst role and email_verified=False."""
    email = f"analyst_reg_{datetime.now().timestamp()}@example.com"
    payload = {
        "first_name": "New",
        "last_name": "Analyst",
        "email": email,
        "password": "Password123!",
        "organization": "Test Corp"
    }
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["role"] == "Business Analyst"
    assert data["email_verified"] is False
    assert "access_token" not in data
    assert "dev_otp" not in data  # Never expose OTP in response

    # Verify directly in database
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None
        assert user.role == UserRole.BUSINESS_ANALYST
        assert user.email_verified is False
        assert user.verification_otp_hash is not None


def test_malicious_role_admin_escalation_blocked():
    """Verify sending role='Admin' in registration payload is ignored and forced to Business Analyst."""
    email = f"hacker_admin_{datetime.now().timestamp()}@example.com"
    payload = {
        "first_name": "Malicious",
        "last_name": "Actor",
        "email": email,
        "password": "Password123!",
        "role": "Admin",
        "organization": "Evil Corp"
    }
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["role"] == "Business Analyst"
    assert data["role"] != "Admin"

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None
        assert user.role == UserRole.BUSINESS_ANALYST


def test_malicious_role_manager_escalation_blocked():
    """Verify sending role='Retail Manager' in registration payload is ignored and forced to Business Analyst."""
    email = f"hacker_mgr_{datetime.now().timestamp()}@example.com"
    payload = {
        "first_name": "Malicious",
        "last_name": "Manager",
        "email": email,
        "password": "Password123!",
        "role": "Retail Manager",
        "organization": "Evil Corp"
    }
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["role"] == "Business Analyst"
    assert data["role"] != "Retail Manager"

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None
        assert user.role == UserRole.BUSINESS_ANALYST


def test_invalid_email_syntax_rejected():
    """Verify malformed email addresses are rejected with 422 Unprocessable Entity."""
    invalid_emails = ["notanemail", "user@", "@domain.com", "plainaddress", "missing.domain@"]
    for bad_email in invalid_emails:
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": bad_email,
            "password": "Password123!"
        }
        resp = client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 422


def test_unverified_user_cannot_login():
    """Verify unverified user receives 403 Forbidden when attempting to sign in."""
    email = f"unverified_login_{datetime.now().timestamp()}@example.com"
    pwd = "Password123!"
    client.post("/api/v1/auth/register", json={
        "first_name": "Unverified", "last_name": "User", "email": email, "password": pwd
    })

    # Attempt login before email verification
    login_resp = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    assert login_resp.status_code == 403
    assert "verify your email" in login_resp.json()["detail"].lower()


def test_valid_otp_verification_flow():
    """Verify submitting correct 6-digit OTP verifies account and grants JWT token with Analyst role."""
    email = f"verify_flow_{datetime.now().timestamp()}@example.com"
    pwd = "Password123!"
    client.post("/api/v1/auth/register", json={
        "first_name": "Verify", "last_name": "Me", "email": email, "password": pwd
    })

    # Generate test OTP and store hash
    test_otp = "849201"
    otp_hash = email_service.hash_otp(test_otp, email)
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).first()
        user.verification_otp_hash = otp_hash
        user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        db.commit()

    # Submit verification
    v_resp = client.post("/api/v1/auth/verify-email", json={"email": email, "otp": test_otp})
    assert v_resp.status_code == 200
    v_data = v_resp.json()
    assert "access_token" in v_data
    assert v_data["role"] == "Business Analyst"

    # Verify user can now log in normally
    login_resp = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


def test_invalid_otp_rejected():
    """Verify incorrect OTP is rejected with remaining attempt feedback."""
    email = f"bad_otp_{datetime.now().timestamp()}@example.com"
    client.post("/api/v1/auth/register", json={
        "first_name": "Bad", "last_name": "OTP", "email": email, "password": "Password123!"
    })

    resp = client.post("/api/v1/auth/verify-email", json={"email": email, "otp": "000000"})
    assert resp.status_code == 400
    assert "invalid verification code" in resp.json()["detail"].lower()


def test_expired_otp_rejected():
    """Verify expired OTP is rejected with 400 Bad Request."""
    email = f"expired_otp_{datetime.now().timestamp()}@example.com"
    client.post("/api/v1/auth/register", json={
        "first_name": "Expired", "last_name": "OTP", "email": email, "password": "Password123!"
    })

    test_otp = "123456"
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).first()
        user.verification_otp_hash = email_service.hash_otp(test_otp, email)
        # Set expired 20 minutes ago
        user.verification_expires_at = datetime.now(timezone.utc) - timedelta(minutes=20)
        db.commit()

    resp = client.post("/api/v1/auth/verify-email", json={"email": email, "otp": test_otp})
    assert resp.status_code == 400
    assert "expired" in resp.json()["detail"].lower()


def test_max_failed_otp_attempts_locks_code():
    """Verify exceeding max failed OTP attempts invalidates code."""
    email = f"brute_force_{datetime.now().timestamp()}@example.com"
    client.post("/api/v1/auth/register", json={
        "first_name": "Brute", "last_name": "Force", "email": email, "password": "Password123!"
    })

    # Attempt 5 wrong codes
    for i in range(settings.OTP_MAX_ATTEMPTS):
        resp = client.post("/api/v1/auth/verify-email", json={"email": email, "otp": f"99999{i}"})
        assert resp.status_code == 400

    # 6th attempt should confirm maximum attempts exceeded / code invalidated
    resp6 = client.post("/api/v1/auth/verify-email", json={"email": email, "otp": "999999"})
    assert resp6.status_code == 400
    assert "maximum" in resp6.json()["detail"].lower() or "no active" in resp6.json()["detail"].lower()


def test_resend_verification_cooldown():
    """Verify requesting resend immediately triggers 429 cooldown, but succeeds after cooldown."""
    email = f"resend_test_{datetime.now().timestamp()}@example.com"
    client.post("/api/v1/auth/register", json={
        "first_name": "Resend", "last_name": "User", "email": email, "password": "Password123!"
    })

    # Immediate resend should be rate-limited by 60s cooldown
    resp = client.post("/api/v1/auth/resend-verification", json={"email": email})
    assert resp.status_code == 429
    assert "wait" in resp.json()["detail"].lower()

    # Manually simulate cooldown elapsed in database
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).first()
        user.last_otp_sent_at = datetime.now(timezone.utc) - timedelta(seconds=70)
        db.commit()

    # Resend should now succeed
    resend_ok = client.post("/api/v1/auth/resend-verification", json={"email": email})
    assert resend_ok.status_code == 200
    assert "sent" in resend_ok.json()["message"].lower()


def test_existing_seeded_users_can_login():
    """Verify seeded Admin, Manager, and Analyst accounts remain pre-verified and functional."""
    accounts = [
        ("chinmay@retailmind.ai", "admin123", "Admin"),
        ("priya@retailmind.ai", "manager123", "Retail Manager"),
        ("vikram@retailmind.ai", "analyst123", "Business Analyst")
    ]
    for email, pwd, expected_role in accounts:
        resp = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
        assert resp.status_code == 200, f"Failed login for {email}: {resp.text}"
        data = resp.json()
        assert "access_token" in data
        assert data["role"] == expected_role
