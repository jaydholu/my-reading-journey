from fastapi import APIRouter, UploadFile, HTTPException, status, Depends, File
from datetime import datetime, timezone

from app.core.cloudinary import upload_profile_picture, delete_cloudinary_image
from app.core.database import db
from app.core.dependencies import get_current_active_user
from app.core.security import get_password_hash, verify_password
from app.schemas.user import UserResponse, UserUpdateRequest, ChangePasswordRequest


router = APIRouter(prefix="/me", tags=["Users"])


def serialize_user(user: dict) -> dict:
    """Serialize user document"""
    return {
        "id": str(user["_id"]),
        "full_name": user["full_name"],
        "user_name": user["user_name"],
        "email": user["email"],
        "profile_picture": user.get("profile_picture"),
        "bio": user.get("bio"),
        "birthdate": user.get("birthdate"),
        "gender": user.get("gender"),
        "country": user.get("country"),
        "city": user.get("city"),
        "favorite_genre": user.get("favorite_genre"),
        "favorite_book": user.get("favorite_book"),
        "reading_goal": user.get("reading_goal"),
        "hobbies": user.get("hobbies"),
        "theme": user.get("theme", "light"),
        "created_at": user["created_at"],
        "last_login": user.get("last_login")
    }


@router.get("/", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_active_user)):
    """Get user profile"""
    return serialize_user(current_user)


@router.put("/", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdateRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Update user profile"""
    
    # Build update document
    update_fields = {
        k: v for k, v in update_data.model_dump(exclude_unset=True).items()
        if v is not None
    }
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data to update"
        )
    
    update_fields["updated_at"] = datetime.now(timezone.utc)
    
    # Update user
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_fields}
    )
    
    # Fetch updated user
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    
    return serialize_user(updated_user)


@router.post("/picture", response_model=UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user)
):
    """Upload profile picture"""
    
    # Delete old picture if exists
    if current_user.get("profile_picture"):
        try:
            await delete_cloudinary_image(current_user["profile_picture"])
        except Exception as e:
            print(f"Failed to delete old image: {e}")
    
    # Upload new picture
    image_url = await upload_profile_picture(file)
    
    # Update user
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "profile_picture": image_url,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Fetch updated user
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    
    return serialize_user(updated_user)


@router.delete("/picture")
async def delete_profile_picture(
    current_user: dict = Depends(get_current_active_user)
):
    """Delete profile picture"""
    
    if not current_user.get("profile_picture"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile picture to delete"
        )
    
    # Delete from Cloudinary
    try:
        await delete_cloudinary_image(current_user["profile_picture"])
    except Exception as e:
        print(f"Failed to delete image: {e}")
    
    # Update user
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "profile_picture": None,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Profile picture deleted"}


@router.put("/password")
async def change_password(
        password_data: ChangePasswordRequest,
        current_user: dict = Depends(get_current_active_user)
):
    """Change user password"""

    # Verify current password
    if not verify_password(password_data.current_password, current_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Update password
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "password": get_password_hash(password_data.new_password),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    return {"message": "Password changed successfully"}


@router.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user: dict = Depends(get_current_active_user)
):
    """Delete user account and all associated data"""
    
    # Delete all user's books
    await db.books.delete_many({"user_id": current_user["_id"]})
    
    # Delete profile picture if exists
    if current_user.get("profile_picture"):
        try:
            await delete_cloudinary_image(current_user["profile_picture"])
        except Exception as e:
            print(f"Failed to delete profile picture: {e}")
    
    # Delete user
    await db.users.delete_one({"_id": current_user["_id"]})
    
    return None