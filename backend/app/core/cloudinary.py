import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings


# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME.get_secret_value(),
    api_key=settings.CLOUDINARY_API_KEY.get_secret_value(),
    api_secret=settings.CLOUDINARY_API_SECRET.get_secret_value(),
    secure=True
)


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_image(file: UploadFile) -> bool:
    """Validate image file"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )
    
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    return True


async def upload_book_cover(file: UploadFile) -> str:
    """Upload book cover to Cloudinary"""
    
    # Validate
    validate_image(file)
    
    try:
        # Read file content
        contents = await file.read()
        
        # Check file size
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large (max 10MB)"
            )
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder="book_covers",
            transformation=[
                {'width': 400, 'height': 600, 'crop': 'fill'},
                {'quality': 'auto:good'},
                {'fetch_format': 'auto'}
            ],
            timeout=60
        )
        
        return result['secure_url']
        
    except cloudinary.exceptions.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )
    finally:
        await file.close()


async def upload_profile_picture(file: UploadFile) -> str:
    """Upload profile picture to Cloudinary"""
    
    validate_image(file)
    
    try:
        contents = await file.read()
        
        if len(contents) > 5 * 1024 * 1024:  # 5MB for profile pics
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large (max 5MB)"
            )
        
        result = cloudinary.uploader.upload(
            contents,
            folder="profile_pictures",
            transformation=[
                {'width': 500, 'height': 500, 'crop': 'fill', 'gravity': 'face'},
                {'quality': 'auto:good'},
                {'fetch_format': 'auto'}
            ],
            timeout=60
        )
        
        return result['secure_url']
        
    except cloudinary.exceptions.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )
    finally:
        await file.close()


async def delete_cloudinary_image(image_url: str):
    """Delete image from Cloudinary"""
    try:
        # Extract public_id from URL
        # https://res.cloudinary.com/cloud/image/upload/v123/folder/public_id.jpg
        parts = image_url.split('/')
        public_id_with_ext = '/'.join(parts[-2:])  # folder/public_id.jpg
        public_id = public_id_with_ext.rsplit('.', 1)[0]  # folder/public_id
        
        cloudinary.uploader.destroy(public_id)
    except Exception as e:
        print(f"Failed to delete image: {e}")
        