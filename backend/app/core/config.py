from pydantic import SecretStr, Field
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = Field(default="My Reading Journey API")
    APP_VERSION: str = Field(default="4.0.0")
    DEBUG: bool = Field(default=True)
    
    # Security
    SECRET_KEY: SecretStr
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=30)
    
    # Database
    MONGODB_URI: SecretStr
    MONGODB_DBNAME: SecretStr = Field(default="myreadingjourney")
    MONGODB_USER: str
    MONGODB_PASSWORD: SecretStr
    
    # Email
    MAIL_USERNAME: str
    MAIL_PASSWORD: SecretStr
    MAIL_FROM: str
    MAIL_SERVER: str = Field(default="smtp.gmail.com")
    MAIL_PORT: int = Field(default=587)
    MAIL_USE_TLS: bool = Field(default=True)
    MAIL_USE_CREDENTIALS: bool = Field(default=True)
    MAIL_VALIDATE_CERTS: bool = Field(default=True)
    MAIL_SSL_TLS: bool = Field(default=False)
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: SecretStr
    CLOUDINARY_API_KEY: SecretStr
    CLOUDINARY_API_SECRET: SecretStr
    CLOUDINARY_URL: SecretStr
    
    # Frontend
    FRONTEND_URL: str = Field(default="http://localhost:5173")
    
    # File Upload
    MAX_UPLOAD_SIZE: int = Field(default=50 * 1024 * 1024)  # 50MB
    MAX_IMAGE_SIZE: int = Field(default=10 * 1024 * 1024)   # 10MB
    
    # CORS
    CORS_ORIGINS: list = Field(default=["http://localhost:5173", "http://localhost:3000"])
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
