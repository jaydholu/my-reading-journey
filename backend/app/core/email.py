from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from typing import List
from jinja2 import Template
from app.core.config import settings


# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD.get_secret_value(),
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_USE_TLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.MAIL_USE_CREDENTIALS,
    VALIDATE_CERTS=settings.MAIL_VALIDATE_CERTS,
)

fastmail = FastMail(conf)


# Email Templates
VERIFICATION_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc7f34, #eb9d44); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #eb9d44; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 My Reading Journey</h1>
        </div>
        <div class="content">
            <h2>Hello {{ name }},</h2>
            <p>Thank you for signing up! Please verify your email address to activate your account.</p>
            <p style="text-align: center;">
                <a href="{{ verify_url }}" class="button">Verify Email</a>
            </p>
            <p>Or copy this link: <br><code>{{ verify_url }}</code></p>
            <p>This link expires in 30 minutes.</p>
            <p>If you didn't create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 My Reading Journey. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

RESET_PASSWORD_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc7f34, #eb9d44); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset</h1>
        </div>
        <div class="content">
            <h2>Hello {{ name }},</h2>
            <p>We received a request to reset your password.</p>
            <p style="text-align: center;">
                <a href="{{ reset_url }}" class="button">Reset Password</a>
            </p>
            <p>Or copy this link: <br><code>{{ reset_url }}</code></p>
            <p>This link expires in 30 minutes.</p>
            <p><strong>If you didn't request this, please ignore this email.</strong></p>
        </div>
        <div class="footer">
            <p>&copy; 2025 My Reading Journey. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""


async def send_verification_email(email: str, name: str, token: str):
    """Send email verification"""
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    print(f"Verification URL: {verify_url}")

    html = Template(VERIFICATION_EMAIL_TEMPLATE).render(
        name=name, verify_url=verify_url
    )

    message = MessageSchema(
        subject="Verify Your Email - My Reading Journey",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    await fastmail.send_message(message)


async def send_password_reset_email(email: str, name: str, token: str):
    """Send password reset email"""
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"

    html = Template(RESET_PASSWORD_TEMPLATE).render(name=name, reset_url=reset_url)

    message = MessageSchema(
        subject="Reset Your Password - My Reading Journey",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    await fastmail.send_message(message)
    