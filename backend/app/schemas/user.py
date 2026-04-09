from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
import re


class UserResponse(BaseModel):
    """User response schema"""
    id: str
    full_name: str
    user_name: str
    email: EmailStr
    profile_picture: str | None = None
    bio: str | None = None
    birthdate: datetime | None = None
    gender: str | None = None
    country: str | None = None
    city: str | None = None
    favorite_genre: str | None = None
    favorite_book: str | None = None
    reading_goal: int | None = None
    hobbies: str | None = None
    theme: str = "light"
    created_at: datetime
    last_login: datetime | None = None


class UserUpdateRequest(BaseModel):
    """User update request schema"""
    full_name: str | None = Field(None, min_length=2, max_length=50)
    bio: str | None = Field(None, max_length=500)
    birthdate: datetime | None = None
    gender: str | None = None
    country: str | None = Field(None, max_length=100)
    city: str | None = Field(None, max_length=100)
    favorite_genre: str | None = Field(None, max_length=50)
    favorite_book: str | None = Field(None, max_length=500)
    reading_goal: int | None = Field(None, ge=1, le=1000)
    hobbies: str | None = Field(None, max_length=200)
    theme: str | None = None
    
    @field_validator('gender')
    @classmethod
    def validate_gender(cls, v):
        if v and v.lower() not in ['male', 'female', 'other', 'prefer_not_to_say']:
            raise ValueError('Invalid gender value')
        return v
    
    @field_validator('theme')
    @classmethod
    def validate_theme(cls, v):
        if v and v not in ['light', 'dark', 'auto']:
            raise ValueError('Invalid theme value')
        return v


class ChangePasswordRequest(BaseModel):
    """Change password request"""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain an uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain a lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain a number')
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v
    