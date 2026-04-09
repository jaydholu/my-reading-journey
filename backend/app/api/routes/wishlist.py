from fastapi import APIRouter, HTTPException, Depends, Query, status
from bson import ObjectId
from datetime import datetime, timezone
import math

from app.core.database import db
from app.core.dependencies import get_current_active_user
from app.schemas.wishlist import (
    WishlistCreateRequest,
    WishlistUpdateRequest,
    WishlistResponse,
    WishlistListResponse,
)


router = APIRouter(tags=["Wishlist"])


# Helper function to serialize wishlist item
def serialize_wishlist(item: dict) -> dict:
    """Convert MongoDB document to WishlistResponse format"""
    return {
        "id": str(item["_id"]),
        "title": item["title"],
        "author": item.get("author"),
        "isbn": item.get("isbn"),
        "genre": item.get("genre"),
        "priority": item.get("priority", 1),
        "notes": item.get("notes"),
        "price": item.get("price"),
        "where_to_buy": item.get("where_to_buy"),
        "created_at": item["created_at"],
        "updated_at": item["updated_at"],
    }


@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
async def create_wishlist_item(
    item_data: WishlistCreateRequest, current_user: dict = Depends(get_current_active_user)
):
    """Add a new book to wishlist"""

    # Prepare wishlist document
    new_item = {
        "user_id": current_user["_id"],
        "title": item_data.title,
        "author": item_data.author,
        "isbn": item_data.isbn,
        "genre": item_data.genre,
        "priority": item_data.priority or 1,
        "notes": item_data.notes,
        "price": item_data.price,
        "where_to_buy": item_data.where_to_buy,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await db["wishlist"].insert_one(new_item)

    # Fetch created item
    created_item = await db["wishlist"].find_one({"_id": result.inserted_id})

    return serialize_wishlist(created_item)


@router.get("/", response_model=WishlistListResponse)
async def list_wishlist(
    genre: str | None = Query(None),
    priority: int | None = Query(None, ge=1, le=5),
    search: str | None = Query(None),
    sort: str = Query("priority_desc"),
    page: int = Query(1, gt=0),
    limit: int = Query(20, gt=0, le=100),
    current_user: dict = Depends(get_current_active_user),
):
    """List user's wishlist with filters and pagination"""

    # Build query
    query = {"user_id": current_user["_id"]}

    if genre:
        query["genre"] = {"$regex": genre, "$options": "i"}

    if priority is not None:
        query["priority"] = priority

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"author": {"$regex": search, "$options": "i"}},
        ]

    # Build sort
    sort_options = {
        "date_desc": [("created_at", -1)],
        "date_asc": [("created_at", 1)],
        "priority_desc": [("priority", -1), ("created_at", -1)],
        "priority_asc": [("priority", 1), ("created_at", -1)],
        "title_asc": [("title", 1)],
        "title_desc": [("title", -1)],
    }
    sort_by = sort_options.get(sort, [("priority", -1)])

    # Count total
    total = await db["wishlist"].count_documents(query)

    # Calculate pagination
    skip = (page - 1) * limit
    pages = math.ceil(total / limit) if total > 0 else 1

    # Fetch wishlist items
    cursor = db["wishlist"].find(query).sort(sort_by).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)

    return {
        "wishlist": [serialize_wishlist(item) for item in items],
        "total": total,
        "page": page,
        "pages": pages,
        "has_next": page < pages,
        "has_prev": page > 1,
    }


@router.get("/{item_id}", response_model=WishlistResponse)
async def get_wishlist_item(
    item_id: str, current_user: dict = Depends(get_current_active_user)
):
    """Get a single wishlist item by ID"""

    try:
        item = await db["wishlist"].find_one(
            {"_id": ObjectId(item_id), "user_id": current_user["_id"]}
        )

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found"
            )

        return serialize_wishlist(item)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid item ID"
        )


@router.put("/{item_id}", response_model=WishlistResponse)
async def update_wishlist_item(
    item_id: str,
    item_data: WishlistUpdateRequest,
    current_user: dict = Depends(get_current_active_user),
):
    """Update a wishlist item"""

    try:
        # Check item exists and belongs to user
        existing_item = await db["wishlist"].find_one(
            {"_id": ObjectId(item_id), "user_id": current_user["_id"]}
        )

        if not existing_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found"
            )

        update_data = {
            k: v for k, v in item_data.model_dump(exclude_unset=True).items() if v is not None
        }

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data to update"
            )

        update_data["updated_at"] = datetime.now(timezone.utc)

        # Update item
        await db["wishlist"].update_one({"_id": ObjectId(item_id)}, {"$set": update_data})

        # Fetch updated item
        updated_item = await db["wishlist"].find_one({"_id": ObjectId(item_id)})

        return serialize_wishlist(updated_item)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wishlist_item(
    item_id: str, current_user: dict = Depends(get_current_active_user)
):
    """Delete a wishlist item"""

    try:
        # Check item exists and belongs to user
        item = await db["wishlist"].find_one(
            {"_id": ObjectId(item_id), "user_id": current_user["_id"]}
        )

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found"
            )

        # Delete item
        await db["wishlist"].delete_one({"_id": ObjectId(item_id)})

        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid item ID"
        )


@router.post("/{item_id}/move-to-library", response_model=dict)
async def move_to_library(
    item_id: str, current_user: dict = Depends(get_current_active_user)
):
    """Move wishlist item to reading library"""

    try:
        # Get wishlist item
        item = await db["wishlist"].find_one(
            {"_id": ObjectId(item_id), "user_id": current_user["_id"]}
        )

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found"
            )

        # Create book from wishlist item
        new_book = {
            "user_id": current_user["_id"],
            "title": item["title"],
            "author": item.get("author"),
            "isbn": item.get("isbn"),
            "genre": item.get("genre"),
            "rating": 0.0,
            "description": item.get("notes"),  # Use notes as description
            "cover_image": None,
            "reading_started": datetime.now(timezone.utc),
            "reading_finished": None,
            "is_favorite": False,
            "page_count": None,
            "publisher": None,
            "publication_year": None,
            "language": "English",
            "format": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        result = await db.books.insert_one(new_book)

        # Delete from wishlist
        await db["wishlist"].delete_one({"_id": ObjectId(item_id)})

        return {
            "message": "Book moved to library successfully",
            "book_id": str(result.inserted_id)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )
