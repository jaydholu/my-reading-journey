from flask import url_for, current_app
from flask_mail import Message
from extensions import mail, s
import logging


logger = logging.getLogger(__name__)


def send_verification_email(user):
    try:
        token = s.dumps(user["email"], salt="email-confirm")
        confirm_url = url_for("auth.verify_email", token=token, _external=True)
        subject = "Please confirm your email"
        body = f"Hello {user['name']},\n\nClick the link below to confirm your email:\n{confirm_url}\n\nIf you didn’t sign up, ignore this email."
        
        msg = Message(subject, sender=current_app.config["MAIL_DEFAULT_SENDER"], recipients=[user["email"]])
        msg.body = body
        mail.send(msg)
        logger.info(f"Verification email sent to {user['email']}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")
        return False


def send_reset_email(user):
    try:
        token = s.dumps(user["email"], salt="password-reset")
        reset_url = url_for("auth.reset_with_token", token=token, _external=True)
        subject = "Password Reset Request"
        body = f"Hello {user['name']},\n\nClick the link below to reset your password:\n{reset_url}\n\nIf you didn’t request a reset, ignore this email."
        
        msg = Message(subject, sender=current_app.config["MAIL_DEFAULT_SENDER"], recipients=[user["email"]])
        msg.body = body
        mail.send(msg)
        logger.info(f"Password reset email sent to {user['email']}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")
        return False
