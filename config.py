import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    PERMANENT_SESSION_LIFETIME = timedelta(days=365)         # Sessions last for 365 days
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024                   # 16 MB limit

    # Mail config
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("EMAIL")
    MAIL_PASSWORD = os.environ.get("PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("EMAIL")

    # Mongo
    MONGO_URI = os.environ.get("MONGO_URI")

    # Cloudinary
    CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")

    # Default Images
    DEFAULT_COVER_IMAGE_URL = "https://res.cloudinary.com/dtjyurnlg/image/upload/v1758600359/ntrbdtdsbbgq33dfczfw.png"
    DEFAULT_PROFILE_PIC_BOY_URL = "https://res.cloudinary.com/dtjyurnlg/image/upload/v1758600114/injtfzadqcwyj4ssq96k.png"
    DEFAULT_PROFILE_PIC_GIRL_URL = "https://res.cloudinary.com/dtjyurnlg/image/upload/v1758600103/nan75ywi1cobch2fvoya.png"
