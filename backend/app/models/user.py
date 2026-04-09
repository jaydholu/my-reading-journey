from pydantic import BaseModel, EmailStr, SecretStr, Field
from datetime import datetime, timezone
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class User(BaseModel):
    """User model"""
    
    id: PyObjectId | None = Field(alias="_id", default=None)
    full_name: str = Field(alias="fullName", min_length=2, max_length=50)
    user_name: str = Field(alias="userName", min_length=3, max_length=30, regex=r'^[a-zA-Z0-9_]+$')
    email: EmailStr = Field(alias="email")
    profile_picture: str | None = Field(alias="profilePicture", default=None)
    bio: str | None = Field(alias="bio", default=None)
    birthdate: datetime | None = Field(alias="birthdate", default=None)
    gender: str | None = Field(alias="gender", default=None)
    country: str | None = Field(alias="country", default=None)
    city: str | None = Field(alias="city", default=None)
    favorite_genre: str | None = Field(alias="favoriteGenre", default=None)
    favorite_book: str | None = Field(alias="favoriteBook", default=None)
    reading_goal: int | None = Field(alias="readingGoal", default=None)
    hobbies: str | None = Field(alias="hobbies", default=None)
    theme: str = Field(alias="theme", default="light")
    is_verified: bool = Field(alias="isVerified", default=False)
    is_active: bool = Field(alias="isActive", default=True)
    created_at: datetime = Field(alias="createdAt", default_factory=datetime.now(timezone.utc))
    updated_at: datetime = Field(alias="updatedAt", default_factory=datetime.now(timezone.utc))
    last_login: datetime | None = Field(alias="lastLogin", default=None)
    
    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


class UserInDB(User):
    """User model with hashed password"""
    password: SecretStr
    