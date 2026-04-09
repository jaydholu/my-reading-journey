from fastapi import APIRouter, UploadFile, HTTPException, status, Depends, File, Query
from fastapi.responses import StreamingResponse
from typing import Literal
from io import BytesIO
from datetime import datetime, timezone
import json

from app.core.database import db
from app.core.dependencies import get_current_active_user
from app.utils.file_handlers import JSONHandler, CSVHandler


router = APIRouter(tags=["Data Import/Export"])


@router.post("/import")
async def import_books(
    file: UploadFile = File(...),
    format_type: Literal["json", "csv"] = Query(..., description="File format"),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Import books from JSON or CSV file.
    Duplicate detection is based on matching title + author (case-insensitive).
    Duplicates already in the library are skipped, not re-imported.
    """

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )

    file_ext = file.filename.rsplit('.', 1)[-1].lower()

    if format_type == "json" and file_ext != "json":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File extension must be .json for JSON format"
        )

    if format_type == "csv" and file_ext != "csv":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File extension must be .csv for CSV format"
        )

    try:
        # Parse file — pass db and user_id for deduplication
        if format_type == "json":
            valid_books, errors = await JSONHandler.parse_import(
                file, user_id=current_user["_id"], db=db
            )
        else:
            valid_books, errors = await CSVHandler.parse_import(
                file, user_id=current_user["_id"], db=db
            )

        # Add user_id and timestamps to valid books
        books_to_insert = []
        for book in valid_books:
            book["user_id"] = current_user["_id"]
            book["created_at"] = datetime.now(timezone.utc)
            book["updated_at"] = datetime.now(timezone.utc)
            books_to_insert.append(book)

        imported_count = 0
        if books_to_insert:
            result = await db.books.insert_many(books_to_insert)
            imported_count = len(result.inserted_ids)

        # Separate duplicate errors from real errors for clearer messaging
        duplicate_errors = [e for e in errors if "Duplicate" in e.get("error", "")]
        real_errors = [e for e in errors if "Duplicate" not in e.get("error", "")]

        return {
            "message": "Import completed",
            "stats": {
                "total": len(valid_books) + len(errors),
                "imported": imported_count,
                "skipped_duplicates": len(duplicate_errors),
                "failed": len(real_errors),
                "errors": (real_errors + duplicate_errors)[:10]  # Return first 10
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Import failed: {str(e)}"
        )
    finally:
        await file.close()


@router.get("/export/json")
async def export_books_json(
    include_favorites_only: bool = Query(False),
    current_user: dict = Depends(get_current_active_user)
):
    """Export all books as JSON file"""

    query = {"user_id": current_user["_id"]}
    if include_favorites_only:
        query["is_favorite"] = True

    cursor = db.books.find(query).sort([("reading_started", -1)])
    books = await cursor.to_list(length=None)
    username = current_user["user_name"]
    print(f"Exporting {len(books)} books for user {username} (favorites only: {include_favorites_only})")

    if not books:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No books found to export"
        )

    serialized_books = []
    for book in books:
        serialized_books.append({
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
            "updated_at": book["updated_at"]
        })

    json_content = JSONHandler.generate_export(serialized_books)
    buffer = BytesIO(json_content.encode('utf-8'))
    filename = f"{username}_books_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    return StreamingResponse(
        buffer,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/csv")
async def export_books_csv(
    include_favorites_only: bool = Query(False),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Export all books as CSV file.
    Includes cover_image URL, full ISO datetime strings for all date fields.
    """

    query = {"user_id": current_user["_id"]}
    if include_favorites_only:
        query["is_favorite"] = True

    cursor = db.books.find(query).sort([("reading_started", -1)])
    books = await cursor.to_list(length=None)

    if not books:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No books found to export"
        )

    serialized_books = []
    for book in books:
        serialized_books.append({
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
            "updated_at": book["updated_at"]
        })

    csv_content = CSVHandler.generate_export(serialized_books)
    buffer = BytesIO(csv_content.encode('utf-8-sig'))  # BOM for Excel compatibility
    filename = f"books_backup_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/template/csv")
async def download_csv_template():
    """Download a CSV template for bulk import"""

    sample_books = [
        {
            "title": "The Great Gatsby",
            "author": "F. Scott Fitzgerald",
            "isbn": "9780743273565",
            "genre": "Classic",
            "rating": 4.5,
            "description": "A classic American novel",
            "cover_image": "",
            "reading_started": datetime(2025, 1, 1, tzinfo=timezone.utc),
            "reading_finished": datetime(2025, 1, 15, tzinfo=timezone.utc),
            "is_favorite": True,
            "page_count": 180,
            "publisher": "Scribner",
            "publication_year": 1925,
            "language": "English",
            "format": "paperback",
            "created_at": datetime(2025, 1, 1, tzinfo=timezone.utc),
            "updated_at": datetime(2025, 1, 15, tzinfo=timezone.utc),
        },
        {
            "title": "1984",
            "author": "George Orwell",
            "isbn": "9780451524935",
            "genre": "Dystopian",
            "rating": 5.0,
            "description": "A dystopian social science fiction novel",
            "cover_image": "",
            "reading_started": datetime(2025, 1, 20, tzinfo=timezone.utc),
            "reading_finished": None,
            "is_favorite": False,
            "page_count": 328,
            "publisher": "Secker & Warburg",
            "publication_year": 1949,
            "language": "English",
            "format": "ebook",
            "created_at": datetime(2025, 1, 20, tzinfo=timezone.utc),
            "updated_at": datetime(2025, 1, 20, tzinfo=timezone.utc),
        }
    ]

    csv_content = CSVHandler.generate_export(sample_books)
    buffer = BytesIO(csv_content.encode('utf-8-sig'))

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=books_import_template.csv"}
    )


# Add these endpoints to backend/app/api/routes/data.py
@router.get("/export/user/json")
async def export_user_data_json(
    current_user: dict = Depends(get_current_active_user)
):
    """Export all user data (profile + books) as JSON"""

    # Get user profile
    user_data = {
        "id": str(current_user["_id"]),
        "full_name": current_user["full_name"],
        "user_name": current_user["user_name"],
        "email": current_user["email"],
        "bio": current_user.get("bio"),
        "birthdate": current_user.get("birthdate"),
        "gender": current_user.get("gender"),
        "country": current_user.get("country"),
        "city": current_user.get("city"),
        "favorite_genre": current_user.get("favorite_genre"),
        "favorite_book": current_user.get("favorite_book"),
        "reading_goal": current_user.get("reading_goal"),
        "hobbies": current_user.get("hobbies"),
        "theme": current_user.get("theme", "light"),
        "created_at": current_user["created_at"],
        "last_login": current_user.get("last_login"),
    }

    # Get all books
    cursor = db.books.find({"user_id": current_user["_id"]}).sort([("reading_started", -1)])
    books = await cursor.to_list(length=None)

    serialized_books = []
    for book in books:
        serialized_books.append({
            "id": str(book["_id"]),
            "title": book["title"],
            "author": book.get("author"),
            "isbn": book.get("isbn"),
            "genre": book.get("genre"),
            "rating": book.get("rating", 0.0),
            "description": book.get("description"),
            "cover_image": book.get("cover_image"),
            "reading_started": book["reading_started"].isoformat() if book.get("reading_started") else None,
            "reading_finished": book.get("reading_finished").isoformat() if book.get("reading_finished") else None,
            "is_favorite": book.get("is_favorite", False),
            "page_count": book.get("page_count"),
            "publisher": book.get("publisher"),
            "publication_year": book.get("publication_year"),
            "language": book.get("language", "English"),
            "format": book.get("format"),
            "created_at": book["created_at"].isoformat() if book.get("created_at") else None,
            "updated_at": book["updated_at"].isoformat() if book.get("updated_at") else None
        })

    # Get wishlist items if collection exists
    wishlist_items = []
    try:
        wishlist_cursor = db["wishlist"].find({"user_id": current_user["_id"]}).sort([("priority", -1)])
        wishlist = await wishlist_cursor.to_list(length=None)
        
        for item in wishlist:
            wishlist_items.append({
                "id": str(item["_id"]),
                "title": item["title"],
                "author": item.get("author"),
                "isbn": item.get("isbn"),
                "genre": item.get("genre"),
                "priority": item.get("priority", 1),
                "notes": item.get("notes"),
                "price": item.get("price"),
                "where_to_buy": item.get("where_to_buy"),
                "created_at": item["created_at"].isoformat() if item.get("created_at") else None,
                "updated_at": item["updated_at"].isoformat() if item.get("updated_at") else None,
            })
    except Exception as e:
        print(f"Wishlist export error: {e}")

    # Compile full export
    export_data = {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "user": user_data,
        "books": serialized_books,
        "wishlist": wishlist_items,
        "stats": {
            "total_books": len(serialized_books),
            "total_wishlist_items": len(wishlist_items)
        }
    }

    # Convert datetime objects to ISO format
    def datetime_handler(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return str(obj)

    json_content = json.dumps(export_data, indent=2, ensure_ascii=False, default=datetime_handler)
    buffer = BytesIO(json_content.encode('utf-8'))
    filename = f"{current_user['user_name']}_full_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    return StreamingResponse(
        buffer,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/user/csv")
async def export_user_data_csv(
    current_user: dict = Depends(get_current_active_user)
):
    """Export user profile data as CSV"""

    import csv
    from io import StringIO

    # Prepare user data for CSV
    user_data = {
        "Field": [],
        "Value": []
    }

    fields = {
        "User ID": str(current_user["_id"]),
        "Full Name": current_user["full_name"],
        "User Name": current_user["user_name"],
        "Email": current_user["email"],
        "Bio": current_user.get("bio", ""),
        "Birthdate": str(current_user.get("birthdate", "")),
        "Gender": current_user.get("gender", ""),
        "Country": current_user.get("country", ""),
        "City": current_user.get("city", ""),
        "Favorite Genre": current_user.get("favorite_genre", ""),
        "Favorite Book": current_user.get("favorite_book", ""),
        "Reading Goal": str(current_user.get("reading_goal", "")),
        "Hobbies": current_user.get("hobbies", ""),
        "Theme": current_user.get("theme", "light"),
        "Account Created": str(current_user.get("created_at", "")),
        "Last Login": str(current_user.get("last_login", "")),
    }

    # Create CSV
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Field", "Value"])
    
    for field, value in fields.items():
        writer.writerow([field, value])

    csv_content = output.getvalue()
    buffer = BytesIO(csv_content.encode('utf-8-sig'))
    filename = f"{current_user['user_name']}_profile_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
