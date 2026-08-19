"""
Email Service & OTP Verification Provider.
Handles cryptographically secure OTP generation, hashing, and email delivery.
Supports SMTP provider and local development console logger.
"""
import os
import secrets
import string
import hashlib
import hmac
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

from app.config import settings

logger = logging.getLogger("retailmind.services.email")


class EmailService:
    """
    Service for sending transactional verification emails and handling OTP lifecycle.
    """

    @staticmethod
    def generate_otp(length: int = 6) -> str:
        """Generate a cryptographically secure numeric OTP."""
        digits = string.digits
        return "".join(secrets.choice(digits) for _ in range(length))

    @staticmethod
    def hash_otp(otp: str, email: str) -> str:
        """Hash OTP with email and secret key using HMAC-SHA256."""
        key = settings.SECRET_KEY.encode("utf-8")
        msg = f"{email.lower().strip()}:{otp.strip()}".encode("utf-8")
        return hmac.new(key, msg, hashlib.sha256).hexdigest()

    @staticmethod
    def verify_otp_hash(plain_otp: str, email: str, stored_hash: str) -> bool:
        """Verify plain OTP against stored hash using constant-time comparison."""
        if not plain_otp or not stored_hash or not email:
            return False
        expected_hash = EmailService.hash_otp(plain_otp, email)
        return hmac.compare_digest(expected_hash, stored_hash)

    def send_verification_otp(self, email: str, otp: str, first_name: Optional[str] = None) -> bool:
        """
        Send verification OTP to user.
        In development / console mode: logs OTP strictly server-side.
        In SMTP mode: dispatches email via configured SMTP relay.
        """
        subject = f"Your RetailMind AI Verification Code: {otp}"
        name = first_name or "RetailMind User"

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 10px;">
            <h2 style="color: #4F46E5;">RetailMind AI Email Verification</h2>
            <p>Hello {name},</p>
            <p>Thank you for registering. Please use the following 6-digit verification code to activate your account:</p>
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1E293B; background: #F1F5F9; padding: 12px; text-align: center; border-radius: 8px; margin: 16px 0;">
                {otp}
            </div>
            <p style="color: #64748B; font-size: 13px;">This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes. If you did not request this, please ignore this email.</p>
        </div>
        """

        provider = (settings.EMAIL_PROVIDER or os.getenv("EMAIL_PROVIDER", "console")).lower()
        if provider == "smtp" and settings.SMTP_HOST:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = settings.EMAIL_FROM
                msg["To"] = email

                text_part = MIMEText(f"Your RetailMind AI verification code is: {otp}. It expires in {settings.OTP_EXPIRE_MINUTES} minutes.", "plain")
                html_part = MIMEText(html_content, "html")

                msg.attach(text_part)
                msg.attach(html_part)

                clean_pwd = (settings.SMTP_PASSWORD or "").replace("-", "").replace(" ", "").strip()
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.starttls()
                    if settings.SMTP_USERNAME and clean_pwd:
                        server.login(settings.SMTP_USERNAME.strip(), clean_pwd)
                    server.sendmail(settings.EMAIL_FROM, [email], msg.as_string())

                logger.info(f"✅ Dispatched verification email via SMTP to {email}")
                return True
            except Exception as e:
                logger.error(f"❌ Failed to dispatch email via SMTP to {email}: {e}")
                # Fallback to server-side logging so registration is not permanently bricked
                logger.info(f"📧 [DEV EMAIL CONSOLE FALLBACK] Verification OTP for {email}: {otp}")
                return False
        else:
            # Console / Development mode — strictly server-side logging
            logger.info(f"📧 [DEV EMAIL CONSOLE] Verification OTP for {email}: {otp} (Valid for {settings.OTP_EXPIRE_MINUTES} mins)")
            return True


email_service = EmailService()
