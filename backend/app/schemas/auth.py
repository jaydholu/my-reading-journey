from pydantic import BaseModel, EmailStr, SecretStr, ValidationInfo, Field, field_validator
import re


class SignupRequest(BaseModel):
    """Signup request schema"""
    full_name: str = Field(..., min_length=2, max_length=50)
    user_name: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: SecretStr = Field(..., min_length=8, max_length=100)
    confirm_password: SecretStr
    
    @field_validator('user_name')
    @classmethod
    def validate_user_name(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('User name can only contain letters, numbers, and underscores')
        return v.lower()
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        password = v.get_secret_value() if isinstance(v, SecretStr) else v
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', password):
            raise ValueError('Password must contain an uppercase letter')
        if not re.search(r'[a-z]', password):
            raise ValueError('Password must contain a lowercase letter')
        if not re.search(r'\d', password):
            raise ValueError('Password must contain a number')
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info: ValidationInfo):
        password = info.data.get('password')
        confirm = v.get_secret_value() if isinstance(v, SecretStr) else v
        pwd = password.get_secret_value() if isinstance(password, SecretStr) else password
        if pwd != confirm:
            raise ValueError('Passwords do not match')
        return v


class LoginRequest(BaseModel):
    """Login request schema"""
    login: str = Field(..., description="Email or User Name")
    password: SecretStr = Field(..., min_length=8)


class VerifyEmailRequest(BaseModel):
    """Verify email request"""
    token: str


class ResendVerificationRequest(BaseModel):
    """Resend verification email request"""
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    """Forgot password request"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request"""
    password: SecretStr = Field(..., min_length=8, max_length=100)
    confirm_password: SecretStr
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        password = v.get_secret_value() if isinstance(v, SecretStr) else v
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', password):
            raise ValueError('Password must contain an uppercase letter')
        if not re.search(r'[a-z]', password):
            raise ValueError('Password must contain a lowercase letter')
        if not re.search(r'\d', password):
            raise ValueError('Password must contain a number')
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info: ValidationInfo):
        password = info.data.get('password')
        confirm = v.get_secret_value() if isinstance(v, SecretStr) else v
        pwd = password.get_secret_value() if isinstance(password, SecretStr) else password
        if pwd != confirm:
            raise ValueError('Passwords do not match')
        return v
    