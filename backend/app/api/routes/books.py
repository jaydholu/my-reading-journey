from fastapi import APIRouter, UploadFile, HTTPException, status, File, Depends, Query
from bson import ObjectId
from datetime import datetime, timezone
import math

from app.core.cloudinary import upload_book_cover, delete_cloudinary_image
from app.core.database import db
from app.core.dependencies import get_current_active_user
from app.schemas.book import (
    BookCreateRequest,
    BookUpdateRequest,
    BookResponse,
    BooksListResponse,
    BookStatsResponse,
)


router = APIRouter(tags=["Books"])


# Helper function to serialize book
def serialize_book(book: dict) -> dict:
    """Convert MongoDB document to BookResponse format"""
    return {
        "id": str(book["_id"]),
        "title": book["title"],
        "author": book.get("author"),
        "isbn": book.get("isbn"),
        "genre": book.get("genre"),
        "rating": book.get("rating", 0.0),
        "description": book.get("description"),
        "cover_image": book.get("cover_image"),
        "reading_started": book["reading_started"],
        "reading_finished": book.get("reading_finished"),
        "is_favorite": book.get("is_favorite", False),
        "page_count": book.get("page_count"),
        "publisher": book.get("publisher"),
        "publication_year": book.get("publication_year"),
        "language": book.get("language", "English"),
        "format": book.get("format"),
        "created_at": book["created_at"],
        "updated_at": book["updated_at"],
    }


@router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    book_data: BookCreateRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new book entry"""

    # Prepare book document
    new_book = {
        "user_id": current_user["_id"],
        "title": book_data.title,
        "author": book_data.author,
        "isbn": book_data.isbn,
        "genre": book_data.genre,
        "rating": book_data.rating or 0.0,
        "description": book_data.description,
        "cover_image": None,  # Will be uploaded separately
        "reading_started": book_data.reading_started,
        "reading_finished": book_data.reading_finished,
        "is_favorite": False,
        "page_count": book_data.page_count,
        "publisher": book_data.publisher,
        "publication_year": book_data.publication_year,
        "language": book_data.language or "English",
        "format": book_data.format,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await db.books.insert_one(new_book)
    created_book = await db.books.find_one({"_id": result.inserted_id})     # Fetch created book

    return serialize_book(created_book)


@router.get("/", response_model=BooksListResponse)
async def list_books(
    favorite: bool | None = Query(None),
    genre: str | None = Query(None),
    author: str | None = Query(None),
    rating_min: float | None = Query(None, ge=0, le=5),
    rating_max: float | None = Query(None, ge=0, le=5),
    year: int | None = Query(None),
    search: str | None = Query(None),
    sort: str = Query("date_desc"),
    page: int = Query(1, gt=0),
    limit: int = Query(20, gt=0, le=100),
    current_user: dict = Depends(get_current_active_user),
):
    """List user's books with filters and pagination"""

    # Build query
    query = {"user_id": current_user["_id"]}

    if favorite is not None:
        query["is_favorite"] = favorite

    if genre:
        query["genre"] = {"$regex": genre, "$options": "i"}

    if author:
        query["author"] = {"$regex": author, "$options": "i"}

    if rating_min is not None or rating_max is not None:
        query["rating"] = {}
        if rating_min is not None:
            query["rating"]["$gte"] = rating_min
        if rating_max is not None:
            query["rating"]["$lte"] = rating_max

    if year:
        query["$expr"] = {"$eq": [{"$year": "$reading_started"}, year]}

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"author": {"$regex": search, "$options": "i"}},
        ]

    # Build sort
    sort_options = {
        "date_asc": [("reading_started", 1)],
        "date_desc": [("reading_started", -1)],
        "title_asc": [("title", 1)],
        "title_desc": [("title", -1)],
        "rating_desc": [("rating", -1)],
        "author_asc": [("author", 1)],
        "author_desc": [("author", -1)],
    }
    sort_by = sort_options.get(sort, [("reading_started", -1)])

    # Count total
    total = await db.books.count_documents(query)

    # Calculate pagination
    skip = (page - 1) * limit
    pages = math.ceil(total / limit)

    # Fetch books
    cursor = db.books.find(query).sort(sort_by).skip(skip).limit(limit)
    books = await cursor.to_list(length=limit)

    return {
        "books": [serialize_book(book) for book in books],
        "total": total,
        "page": page,
        "pages": pages,
        "has_next": page < pages,
        "has_prev": page > 1,
    }


@router.get("/favorites", response_model=BooksListResponse)
async def list_favorite_books(
    page: int = Query(1, gt=0),
    limit: int = Query(20, gt=0, le=100),
    current_user: dict = Depends(get_current_active_user),
):
    """List user's favorite books"""

    query = {"user_id": current_user["_id"], "is_favorite": True}

    total = await db.books.count_documents(query)
    skip = (page - 1) * limit
    pages = math.ceil(total / limit)

    cursor = (
        db.books.find(query).sort([("reading_started", -1)]).skip(skip).limit(limit)
    )
    books = await cursor.to_list(length=limit)

    return {
        "books": [serialize_book(book) for book in books],
        "total": total,
        "page": page,
        "pages": pages,
        "has_next": page < pages,
        "has_prev": page > 1,
    }


@router.get("/stats", response_model=BookStatsResponse)
async def get_book_stats(current_user: dict = Depends(get_current_active_user)):
    """Get user's reading statistics"""

    pipeline = [
        {"$match": {"user_id": current_user["_id"]}},
        {
            "$group": {
                "_id": None,
                "total_books": {"$sum": 1},
                "books_finished": {
                    "$sum": {"$cond": [{"$ne": ["$reading_finished", None]}, 1, 0]}
                },
                "favorite_books": {
                    "$sum": {"$cond": ["$is_favorite", 1, 0]}
                },
                "books_rated_count": {
                    "$sum": {"$cond": [{"$gt": ["$rating", 0]}, 1, 0]}
                },
                "average_rating": {
                    "$avg": {"$cond": [{"$gt": ["$rating", 0]}, "$rating", "$$REMOVE"]}
                },
                "total_pages": {"$sum": "$page_count"},
            }
        },
    ]

    result = await db.books.aggregate(pipeline).to_list(length=1)

    if not result:
        wishlist_count = await db.wishlist.count_documents({"user_id": current_user["_id"]})
        return {
            "average_rating": 0.0,
            "books_by_genre": {},
            "books_by_year": {},
            "books_finished": 0,
            "books_rated_count": 0,
            "books_reading": 0,
            "favorite_books": 0,
            "total_pages": 0,
            "total_books": 0,
            "wishlist_count": wishlist_count,
            "trends": None,
        }

    stats = result[0]

    # Get books by genre
    genre_pipeline = [
        {"$match": {"user_id": current_user["_id"], "genre": {"$ne": None}}},
        {"$group": {"_id": "$genre", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    genres = await db.books.aggregate(genre_pipeline).to_list(length=None)
    books_by_genre = {g["_id"]: g["count"] for g in genres}

    # Get books by year
    year_pipeline = [
        {"$match": {"user_id": current_user["_id"]}},
        {"$group": {"_id": {"$year": "$reading_started"}, "count": {"$sum": 1}}},
        {"$sort": {"_id": -1}},
    ]
    years = await db.books.aggregate(year_pipeline).to_list(length=None)
    books_by_year = {str(y["_id"]): y["count"] for y in years}

    # Get wishlist count
    wishlist_count = await db.wishlist.count_documents({"user_id": current_user["_id"]})

    # ── Monthly trends (this month vs last month) ─────────────────────────
    now = datetime.now(timezone.utc)
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if this_month_start.month == 1:
        last_month_start = this_month_start.replace(year=this_month_start.year - 1, month=12)
    else:
        last_month_start = this_month_start.replace(month=this_month_start.month - 1)

    def _month_match(start, end):
        return {"user_id": current_user["_id"], "created_at": {"$gte": start, "$lt": end}}

    def _month_finished_match(start, end):
        return {
            "user_id": current_user["_id"],
            "reading_finished": {"$gte": start, "$lt": end},
        }

    this_month_added = await db.books.count_documents(_month_match(this_month_start, now))
    last_month_added = await db.books.count_documents(_month_match(last_month_start, this_month_start))

    this_month_finished = await db.books.count_documents(_month_finished_match(this_month_start, now))
    last_month_finished = await db.books.count_documents(_month_finished_match(last_month_start, this_month_start))

    # Pages read this month vs last month
    pages_pipeline = [
        {"$match": {**_month_match(this_month_start, now), "page_count": {"$gt": 0}}},
        {"$group": {"_id": None, "total": {"$sum": "$page_count"}}},
    ]
    pages_this = await db.books.aggregate(pages_pipeline).to_list(length=1)
    pages_this_val = pages_this[0]["total"] if pages_this else 0

    pages_pipeline_last = [
        {"$match": {**_month_match(last_month_start, this_month_start), "page_count": {"$gt": 0}}},
        {"$group": {"_id": None, "total": {"$sum": "$page_count"}}},
    ]
    pages_last = await db.books.aggregate(pages_pipeline_last).to_list(length=1)
    pages_last_val = pages_last[0]["total"] if pages_last else 0

    # Wishlist trend: items added this month vs last
    this_month_wishlist = await db["wishlist"].count_documents(_month_match(this_month_start, now))
    last_month_wishlist = await db["wishlist"].count_documents(_month_match(last_month_start, this_month_start))

    def _trend(current, previous):
        diff = current - previous
        if diff > 0:
            return {"direction": "up", "value": f"+{diff} this month"}
        elif diff < 0:
            return {"direction": "down", "value": f"{diff} this month"}
        return None

    trends = {
        "total_books": _trend(this_month_added, last_month_added),
        "books_finished": _trend(this_month_finished, last_month_finished),
        "total_pages": _trend(pages_this_val, pages_last_val),
        "wishlist": _trend(this_month_wishlist, last_month_wishlist),
    }

    return {
        "average_rating": round(stats.get("average_rating", 0), 1),
        "books_by_genre": books_by_genre,
        "books_by_year": books_by_year,
        "books_finished": stats["books_finished"],
        "books_rated_count": stats.get("books_rated_count", 0) or 0,
        "books_reading": stats["total_books"] - stats["books_finished"],
        "favorite_books": stats["favorite_books"],
        "total_books": stats["total_books"],
        "total_pages": stats.get("total_pages", 0) or 0,
        "wishlist_count": wishlist_count,
        "trends": trends,
    }


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get a single book by ID"""

    try:
        book = await db.books.find_one(
            {"_id": ObjectId(book_id), "user_id": current_user["_id"]}
        )

        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
            )

        return serialize_book(book)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid book ID"
        )


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    book_data: BookUpdateRequest,
    current_user: dict = Depends(get_current_active_user),
):
    """Update a book"""

    try:
        # Check book exists and belongs to user
        existing_book = await db.books.find_one(
            {"_id": ObjectId(book_id), "user_id": current_user["_id"]}
        )

        if not existing_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
            )

        update_data = {
            k: v for k, v in book_data.model_dump(exclude_unset=True).items() if v is not None
        }

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data to update"
            )

        update_data["updated_at"] = datetime.now(timezone.utc)

        # Update book
        await db.books.update_one({"_id": ObjectId(book_id)}, {"$set": update_data})

        # Fetch updated book
        updated_book = await db.books.find_one({"_id": ObjectId(book_id)})

        return serialize_book(updated_book)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Delete a book"""

    try:
        # Check book exists and belongs to user
        book = await db.books.find_one(
            {"_id": ObjectId(book_id), "user_id": current_user["_id"]}
        )

        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
            )

        # Delete cover image from Cloudinary if exists
        if book.get("cover_image"):
            try:
                await delete_cloudinary_image(book["cover_image"])
            except Exception as e:
                print(f"Failed to delete image: {e}")

        # Delete book
        await db.books.delete_one({"_id": ObjectId(book_id)})

        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid book ID"
        )


@router.patch("/{book_id}/favorite", response_model=BookResponse)
async def toggle_favorite(
    book_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Toggle book favorite status"""

    try:
        book = await db.books.find_one(
            {"_id": ObjectId(book_id), "user_id": current_user["_id"]}
        )

        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
            )

        # Toggle favorite
        new_favorite_status = not book.get("is_favorite", False)

        await db.books.update_one(
            {"_id": ObjectId(book_id)},
            {
                "$set": {
                    "is_favorite": new_favorite_status,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        # Fetch updated book
        updated_book = await db.books.find_one({"_id": ObjectId(book_id)})

        return serialize_book(updated_book)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid book ID"
        )


@router.post("/{book_id}/cover-image", response_model=BookResponse)
async def upload_cover_image(
    book_id: str,
    file: UploadFile = File(None),
    current_user: dict = Depends(get_current_active_user),
):
    """Upload book cover image"""

    try:
        # Check book exists
        book = await db.books.find_one(
            {"_id": ObjectId(book_id), "user_id": current_user["_id"]}
        )

        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
            )

        # Delete old image if exists
        if book.get("cover_image"):
            try:
                await delete_cloudinary_image(book["cover_image"])
            except Exception as e:
                print(f"Failed to delete old image: {e}")

        # Upload new image
        image_url = await upload_book_cover(file)

        # Update book
        await db.books.update_one(
            {"_id": ObjectId(book_id)},
            {
                "$set": {
                    "cover_image": image_url,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        # Fetch updated book
        updated_book = await db.books.find_one({"_id": ObjectId(book_id)})

        return serialize_book(updated_book)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{book_id}/next", response_model=BookResponse)
async def get_next_book(
    book_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get the next book in the user's library"""

    try:
        # Get current book
        current_book = await db.books.find_one(
            {"_id": ObjectId(book_id), "user_id": current_user["_id"]}
        )

        if not current_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
            )

        # Find next book (by reading_started date, descending)
        next_book = await db.books.find_one(
            {
                "user_id": current_user["_id"],
                "_id": {"$ne": ObjectId(book_id)},
                "reading_started": {"$gt": current_book["reading_started"]}
            },
            sort=[("reading_started", 1)]
        )

        # If no next book found, get the first book (wrap around)
        if not next_book:
            next_book = await db.books.find_one(
                {
                    "user_id": current_user["_id"],
                    "_id": {"$ne": ObjectId(book_id)}
                },
                sort=[("reading_started", 1)]
            )

        if not next_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="No other books in library"
            )

        return serialize_book(next_book)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )
    