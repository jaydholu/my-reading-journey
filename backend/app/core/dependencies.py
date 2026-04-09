from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from bson import ObjectId

from app.core.security import decode_token
from app.core.database import db


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Get current authenticated user from JWT token

    Validates:
    - Token format and signature
    - Token type (must be access token)
    - User existence
    - Email verification
    - Account active status
    """
    try:
        token = credentials.credentials
        payload = decode_token(token)

        # Verify token type
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
            )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
            )

        # Get user from database
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Check verification status
        if not user.get("is_verified"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified. Please check your email.",
            )

        # Check active status
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account deactivated. Contact support.",
            )

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Get current active user
    Alias for get_current_user (kept for clarity)
    """
    return current_user


def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict | None:
    """
    Get current user if authenticated, None otherwise
    Used for endpoints that work with or without auth
    """
    if credentials is None:
        return None

    try:
        return get_current_user(credentials)
    except HTTPException:
        return None
    