from pydantic import BaseModel


class Token(BaseModel):
    """Token response model"""
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenPayload(BaseModel):
    """JWT token payload"""
    sub: str  # user_id
    type: str  # access, refresh, email_verification, password_reset
    exp: int  # expiration timestamp
    purpose: str | None = None  # For special tokens
    