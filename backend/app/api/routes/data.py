from fastapi import APIRouter, UploadFile, HTTPException, status, Depends, File, Query
from fastapi.responses import StreamingResponse
from typing import Any, Literal
from io import BytesIO
from datetime import datetime, timezone
import json

from app.core.database import db
from app.core.dependencies import get_current_active_user
from app.utils.file_handlers import JSONHandler, CSVHandler


router = APIRouter(tags=["Data Import/Export"])


# ─── Helper: serialize a book document ────────────────────────────────────────
def _serialize_book(book: dict) -> dict:
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


def _serialize_wishlist_item(item: dict) -> dict:
    return {
        "id": str(item["_id"]),
        "title": item["title"],
        "author": item.get("author"),
        "isbn": item.get("isbn"),
        "genre": item.get("genre"),
        "priority": item.get("priority", 1),
        "notes": item.get("notes"),
        "price": float(item["price"]) if item.get("price") is not None else None,
        "acquisition_type": item.get("acquisition_type", "buy_online"),
        "where_to_buy": item.get("where_to_buy"),
        "borrowed_from": item.get("borrowed_from"),
        "created_at": item["created_at"],
        "updated_at": item["updated_at"],
    }


# ─── Selective Export (new unified endpoint) ──────────────────────────────────
@router.get("/export/selective")
async def export_selective(
    include_profile: bool = Query(False, description="Include user profile data"),
    include_books: bool = Query(True, description="Include library books"),
    include_favorites_only: bool = Query(False, description="If include_books=True, only export favorites"),
    include_wishlist: bool = Query(False, description="Include wishlist items"),
    current_user: dict = Depends(get_current_active_user),
):
    """
    Selective export: the user picks which sections to include via checkboxes.
    Always produces a structured JSON with only the requested sections.
    """

    if not any([include_profile, include_books, include_wishlist]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select at least one data category to export",
        )

    export_data: dict[str, Any] = {
        "export_info": {
            "app": "My Reading Journey",
            "export_date": datetime.now(timezone.utc).isoformat(),
            "version": "2.0",
            "sections_included": [],
        }
    }

    # ── Profile ───────────────────────────────────────────────────────────────
    if include_profile:
        export_data["export_info"]["sections_included"].append("profile")
        export_data["profile"] = {
            "full_name": current_user.get("full_name"),
            "user_name": current_user.get("user_name"),
            "email": current_user.get("email"),
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
            "created_at": current_user.get("created_at"),
            "last_login": current_user.get("last_login"),
        }

    # ── Books ─────────────────────────────────────────────────────────────────
    if include_books:
        section_label = "favorites" if include_favorites_only else "books"
        export_data["export_info"]["sections_included"].append(section_label)

        query = {"user_id": current_user["_id"]}
        if include_favorites_only:
            query["is_favorite"] = True

        cursor = db.books.find(query).sort([("reading_started", -1)])
        books = await cursor.to_list(length=None)
        export_data["books"] = [_serialize_book(b) for b in books]

    # ── Wishlist ──────────────────────────────────────────────────────────────
    if include_wishlist:
        export_data["export_info"]["sections_included"].append("wishlist")

        cursor = db["wishlist"].find(
            {"user_id": current_user["_id"]}
        ).sort([("priority", -1)])
        items = await cursor.to_list(length=None)
        export_data["wishlist"] = [_serialize_wishlist_item(i) for i in items]

    # ── Stats summary ─────────────────────────────────────────────────────────
    export_data["export_info"]["counts"] = {
        "books": len(export_data.get("books", [])),
        "wishlist": len(export_data.get("wishlist", [])),
    }

    # ── Stream response ───────────────────────────────────────────────────────
    def datetime_handler(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return str(obj)

    json_content = json.dumps(export_data, indent=2, ensure_ascii=False, default=datetime_handler)
    buffer = BytesIO(json_content.encode("utf-8"))
    username = current_user.get("user_name", "user")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{username}_export_{timestamp}.json"

    return StreamingResponse(
        buffer,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ─── Import (upgraded to handle structured + legacy formats) ──────────────────
@router.post("/import")
async def import_data(
    file: UploadFile = File(...),
    format_type: Literal["json", "csv"] = Query(..., description="File format"),
    current_user: dict = Depends(get_current_active_user),
):
    """
    Import data from JSON or CSV file.

    JSON files can be:
      - Legacy flat array: [{book}, {book}, ...]
      - Structured export:  { books: [...], wishlist: [...], ... }

    CSV files always import books only (same as before).
    Duplicates (matching title+author) are skipped.
    """

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename"
        )

    file_ext = file.filename.rsplit(".", 1)[-1].lower()

    if format_type == "json" and file_ext != "json":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File extension must be .json for JSON format",
        )
    if format_type == "csv" and file_ext != "csv":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File extension must be .csv for CSV format",
        )

    try:
        if format_type == "csv":
            # CSV → books only (unchanged)
            valid_books, errors = await CSVHandler.parse_import(
                file, user_id=current_user["_id"], db=db
            )
            return await _insert_books_and_respond(valid_books, errors, current_user)

        # ── JSON: detect format ───────────────────────────────────────────
        await JSONHandler.validate_file_size(file)
        contents = await file.read()
        data = json.loads(contents.decode("utf-8"))

        # Legacy format: top-level list → treat as books array
        if isinstance(data, list):
            await file.seek(0)
            valid_books, errors = await JSONHandler.parse_import(
                file, user_id=current_user["_id"], db=db
            )
            return await _insert_books_and_respond(valid_books, errors, current_user)

        # Structured format: { books: [...], wishlist: [...], ... }
        if not isinstance(data, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JSON must be an array of books or a structured export object",
            )

        results = {
            "message": "Import completed",
            "sections": {},
        }

        # ── Import books ──────────────────────────────────────────────────
        if "books" in data and isinstance(data["books"], list) and data["books"]:
            valid_books = []
            book_errors = []

            # Build dedup set
            existing_keys = set()
            existing_cursor = db.books.find(
                {"user_id": current_user["_id"]},
                {"title": 1, "author": 1, "language": 1},
            )
            async for bk in existing_cursor:
                key = (
                    (bk.get("title") or "").strip().lower(),
                    (bk.get("author") or "").strip().lower(),
                    (bk.get("language") or "english").strip().lower(),
                )
                existing_keys.add(key)

            for idx, entry in enumerate(data["books"], start=1):
                try:
                    book = JSONHandler._validate_book_entry(entry, idx)
                    dup_key = (
                        (book.get("title") or "").strip().lower(),
                        (book.get("author") or "").strip().lower(),
                        (book.get("language") or "english").strip().lower(),
                    )
                    if dup_key in existing_keys:
                        book_errors.append({"row": idx, "error": "Duplicate — skipped"})
                        continue
                    existing_keys.add(dup_key)
                    book["user_id"] = current_user["_id"]
                    book["created_at"] = datetime.now(timezone.utc)
                    book["updated_at"] = datetime.now(timezone.utc)
                    valid_books.append(book)
                except (ValueError, Exception) as e:
                    book_errors.append({"row": idx, "error": str(e)})

            imported_books = 0
            if valid_books:
                result = await db.books.insert_many(valid_books)
                imported_books = len(result.inserted_ids)

            dup_count = sum(1 for e in book_errors if "Duplicate" in e.get("error", ""))
            results["sections"]["books"] = {
                "total": len(data["books"]),
                "imported": imported_books,
                "skipped_duplicates": dup_count,
                "failed": len(book_errors) - dup_count,
                "errors": book_errors[:10],
            }

        # ── Import wishlist ───────────────────────────────────────────────
        if "wishlist" in data and isinstance(data["wishlist"], list) and data["wishlist"]:
            valid_items = []
            wish_errors = []

            # Build dedup set for wishlist (title + author)
            existing_wish_keys = set()
            existing_wish_cursor = db["wishlist"].find(
                {"user_id": current_user["_id"]}, {"title": 1, "author": 1}
            )
            async for wi in existing_wish_cursor:
                key = (
                    (wi.get("title") or "").strip().lower(),
                    (wi.get("author") or "").strip().lower(),
                )
                existing_wish_keys.add(key)

            for idx, entry in enumerate(data["wishlist"], start=1):
                try:
                    title = (entry.get("title") or "").strip()
                    if not title:
                        wish_errors.append({"row": idx, "error": "Missing title"})
                        continue

                    dup_key = (
                        title.lower(),
                        (entry.get("author") or "").strip().lower(),
                    )
                    if dup_key in existing_wish_keys:
                        wish_errors.append({"row": idx, "error": "Duplicate — skipped"})
                        continue
                    existing_wish_keys.add(dup_key)

                    price_raw = entry.get("price")
                    price = None
                    if price_raw is not None:
                        try:
                            price = float(price_raw)
                            if price < 0:
                                price = None
                        except (ValueError, TypeError):
                            price = None

                    priority = entry.get("priority", 1)
                    try:
                        priority = int(priority)
                        priority = max(1, min(5, priority))
                    except (ValueError, TypeError):
                        priority = 1

                    valid_acq_types = {"buy_online", "already_purchased", "borrowed"}
                    acq_type = entry.get("acquisition_type", "buy_online")
                    if acq_type not in valid_acq_types:
                        acq_type = "buy_online"

                    item = {
                        "user_id": current_user["_id"],
                        "title": title,
                        "author": (entry.get("author") or "").strip() or None,
                        "isbn": (entry.get("isbn") or "").strip() or None,
                        "genre": (entry.get("genre") or "").strip() or None,
                        "priority": priority,
                        "notes": (entry.get("notes") or "").strip() or None,
                        "price": price,
                        "acquisition_type": acq_type,
                        "where_to_buy": (entry.get("where_to_buy") or "").strip() or None,
                        "borrowed_from": (entry.get("borrowed_from") or "").strip() or None,
                        "created_at": datetime.now(timezone.utc),
                        "updated_at": datetime.now(timezone.utc),
                    }
                    valid_items.append(item)
                except Exception as e:
                    wish_errors.append({"row": idx, "error": str(e)})

            imported_wish = 0
            if valid_items:
                result = await db["wishlist"].insert_many(valid_items)
                imported_wish = len(result.inserted_ids)

            dup_count = sum(1 for e in wish_errors if "Duplicate" in e.get("error", ""))
            results["sections"]["wishlist"] = {
                "total": len(data["wishlist"]),
                "imported": imported_wish,
                "skipped_duplicates": dup_count,
                "failed": len(wish_errors) - dup_count,
                "errors": wish_errors[:10],
            }

        if not results["sections"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No importable data found in the file. Expected 'books' or 'wishlist' arrays.",
            )

        return results

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid JSON format: {str(e)}",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Import failed: {str(e)}",
        )
    finally:
        await file.close()


async def _insert_books_and_respond(valid_books, errors, current_user):
    """Helper for legacy flat-array book imports."""
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

    duplicate_errors = [e for e in errors if "Duplicate" in e.get("error", "")]
    real_errors = [e for e in errors if "Duplicate" not in e.get("error", "")]

    return {
        "message": "Import completed",
        "stats": {
            "total": len(valid_books) + len(errors),
            "imported": imported_count,
            "skipped_duplicates": len(duplicate_errors),
            "failed": len(real_errors),
            "errors": (real_errors + duplicate_errors)[:10],
        },
    }


# ─── Legacy endpoints (kept for backward compatibility) ──────────────────────

@router.get("/export/json")
async def export_books_json(
    include_favorites_only: bool = Query(False),
    current_user: dict = Depends(get_current_active_user),
):
    """Export all books as JSON file (legacy — flat array)"""
    query = {"user_id": current_user["_id"]}
    if include_favorites_only:
        query["is_favorite"] = True

    cursor = db.books.find(query).sort([("reading_started", -1)])
    books = await cursor.to_list(length=None)

    if not books:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No books found to export")

    serialized = [_serialize_book(b) for b in books]
    json_content = JSONHandler.generate_export(serialized)
    buffer = BytesIO(json_content.encode("utf-8"))
    username = current_user.get("user_name", "user")
    filename = f"{username}_books_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    return StreamingResponse(
        buffer,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/export/csv")
async def export_books_csv(
    include_favorites_only: bool = Query(False),
    current_user: dict = Depends(get_current_active_user),
):
    """Export all books as CSV file (legacy)"""
    query = {"user_id": current_user["_id"]}
    if include_favorites_only:
        query["is_favorite"] = True

    cursor = db.books.find(query).sort([("reading_started", -1)])
    books = await cursor.to_list(length=None)

    if not books:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No books found to export")

    serialized = [_serialize_book(b) for b in books]
    csv_content = CSVHandler.generate_export(serialized)
    buffer = BytesIO(csv_content.encode("utf-8-sig"))
    filename = f"books_backup_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
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
        },
    ]

    csv_content = CSVHandler.generate_export(sample_books)
    buffer = BytesIO(csv_content.encode("utf-8-sig"))

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=books_import_template.csv"},
    )


# ─── Legacy user data exports (kept for Settings page) ───────────────────────
@router.get("/export/user/json")
async def export_user_data_json(current_user: dict = Depends(get_current_active_user)):
    """Export all user data (profile + books + wishlist) as JSON — used by Settings page"""
    # Redirect to the new selective export with everything included
    from fastapi.responses import RedirectResponse
    # Build internally instead for simplicity
    return await export_selective(
        include_profile=True,
        include_books=True,
        include_favorites_only=False,
        include_wishlist=True,
        current_user=current_user,
    )


@router.get("/export/user/csv")
async def export_user_data_csv(current_user: dict = Depends(get_current_active_user)):
    """Export user profile data as CSV"""
    import csv as csv_mod
    from io import StringIO

    fields = {
        "Full Name": current_user.get("full_name", ""),
        "User Name": current_user.get("user_name", ""),
        "Email": current_user.get("email", ""),
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

    output = StringIO()
    writer = csv_mod.writer(output)
    writer.writerow(["Field", "Value"])
    for field, value in fields.items():
        writer.writerow([field, value])

    buffer = BytesIO(output.getvalue().encode("utf-8-sig"))
    filename = f"{current_user.get('user_name', 'user')}_profile_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
