from fastapi import APIRouter, HTTPException, Request, Response, status, Depends, Cookie
from fastapi.concurrency import run_in_threadpool
from bson import ObjectId
from jose import JWTError
from datetime import datetime, timezone, timedelta

from app.core.database import db
from app.core.dependencies import get_current_active_user
from app.core.email import send_verification_email, send_password_reset_email
from app.schemas.auth import SignupRequest, LoginRequest, ResendVerificationRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    create_refresh_token,
    decode_token
)


router = APIRouter(tags=["Authentication"])


@router.post("/register")
async def signup(data: SignupRequest):
    """Create new user account"""
    
    # Check if email exists
    existing_email = await db.users.find_one({"email": str(data.email).lower()})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered! Please use a different email to Sign-up."
        )
    
    # Check if user_name exists
    existing_user_name = await db.users.find_one({"user_name": data.user_name.lower()})
    if existing_user_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User name already taken! Choose a different one."
        )
    
    hashed_password = await run_in_threadpool(get_password_hash, data.password.get_secret_value())
    
    # Create user
    new_user = {
        "full_name": data.full_name,
        "user_name": data.user_name.lower(),
        "email": str(data.email).lower(),
        "password": hashed_password,
        "theme": "light",
        "is_verified": False,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.users.insert_one(new_user)
    user_id = str(result.inserted_id)
    
    # Create verification token (30 min expiry)
    verification_token = create_access_token(
        data={"sub": user_id, "purpose": "email_verification"},
        expires_delta=timedelta(minutes=30)
    )
    
    # Send verification email
    try:
        await send_verification_email(
            email=str(data.email),
            name=data.full_name,
            token=verification_token
        )
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        # Don't fail signup if email fails
    
    return {
        "message": "Account created successfully. Please check your email to verify.",
        "user": {
            "id": user_id,
            "full_name": data.full_name,
            "user_name": data.user_name,
            "email": data.email
        }
    }


@router.post("/login")
async def login(data: LoginRequest, response: Response):
    """Login with email/user_name and password"""

    # Find user by email or user_name
    user = await db.users.find_one({
        "$or": [
            {"email": data.login.lower()},
            {"user_name": data.login.lower()}
        ]
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="User does not exist"
        )

    password_is_correct = await run_in_threadpool(
        verify_password, 
        data.password.get_secret_value(), 
        user["password"]
    )

    if not password_is_correct:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )

    if not user.get("is_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your email."
        )

    if not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated"
        )

    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )

    # Create tokens
    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})

    # Set refresh token in httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 3600,
        "user": {
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "user_name": user["user_name"],
            "email": user["email"],
            "theme": user.get("theme", "light"),
            "profile_picture": user.get("profile_picture")
        }
    }


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """Get current user information"""
    return {
        "id": str(current_user["_id"]),
        "full_name": current_user["full_name"],
        "user_name": current_user["user_name"],
        "email": current_user["email"],
        "theme": current_user.get("theme", "light"),
        "profile_picture": current_user.get("profile_picture"),
        "is_verified": current_user.get("is_verified", False),
        "is_active": current_user.get("is_active", True)
    }


@router.post("/refresh")
async def refresh_token(
    request: Request,
    refresh_token: str = Cookie(None)
):
    """Refresh access token using refresh token from cookie"""
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    try:
        payload = decode_token(refresh_token)
        
        # Verify it's a refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        
        # Check if user still exists and is active
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user or not user.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new access token
        new_access_token = create_access_token(data={"sub": user_id})
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": 3600
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )


@router.post("/verify-email/{token}")
async def verify_email(token: str):
    """Verify user email"""
    try:
        payload = decode_token(token)
        
        if payload.get("purpose") != "email_verification":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token"
            )
        
        user_id = payload.get("sub")
        
        # Update user
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_verified": True, "updated_at": datetime.now(timezone.utc)}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or already verified"
            )
        
        return {"message": "Email verified successfully! You can now log in."}
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )


@router.post("/resend-verification")
async def resend_verification(request: ResendVerificationRequest):
    """Resend verification email"""
    user = await db.users.find_one({"email": request.email.lower()})
    
    if not user:
        return {"message": "If account exists, verification email has been sent"}
    
    if user.get("is_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Create new token
    verification_token = create_access_token(
        data={"sub": str(user["_id"]), "purpose": "email_verification"},
        expires_delta=timedelta(minutes=30)
    )
    
    try:
        await send_verification_email(
            email=user["email"],
            name=user["full_name"],
            token=verification_token
        )
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )
    
    return {"message": "Verification email sent"}


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset"""
    user = await db.users.find_one({"email": request.email.lower()})
    
    if not user:
        return {"message": "If account exists, password reset email has been sent"}
    
    # Create reset token
    reset_token = create_access_token(
        data={"sub": str(user["_id"]), "purpose": "password_reset"},
        expires_delta=timedelta(minutes=30)
    )
    
    try:
        await send_password_reset_email(
            email=user["email"],
            name=user["full_name"],
            token=reset_token
        )
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
    
    return {"message": "Password reset email sent"}


@router.post("/reset-password/{token}")
async def reset_password(token: str, request: ResetPasswordRequest):
    """Reset password with token"""
    try:
        payload = decode_token(token)
        
        if payload.get("purpose") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )
        
        if request.password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        user_id = payload.get("sub")
        hashed_password = await run_in_threadpool(get_password_hash, request.password)
        
        # Update password
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "password": hashed_password,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "Password reset successfully"}
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )


@router.post("/logout")
async def logout(response: Response):
    """Logout user"""
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}