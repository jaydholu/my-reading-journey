import csv
import json
from io import StringIO
from datetime import datetime, timezone
from typing import List, Dict, Tuple
from fastapi import UploadFile, HTTPException, status
from bson import ObjectId


class FileHandler:
    """Base class for file handling"""

    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

    @staticmethod
    async def validate_file_size(file: UploadFile) -> bool:
        """Validate file size"""
        contents = await file.read()
        file_size = len(contents)
        await file.seek(0)  # Reset file pointer

        if file_size > FileHandler.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {FileHandler.MAX_FILE_SIZE / (1024*1024)}MB"
            )

        return True


class JSONHandler(FileHandler):
    """Handle JSON file operations"""

    @staticmethod
    async def parse_import(file: UploadFile, user_id=None, db=None) -> Tuple[List[Dict], List[Dict]]:
        """
        Parse JSON file for import
        Returns: (valid_books, errors)
        """
        await JSONHandler.validate_file_size(file)

        try:
            contents = await file.read()
            data = json.loads(contents.decode('utf-8'))

            if not isinstance(data, list):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="JSON file must contain an array of books"
                )

            valid_books = []
            errors = []
            skipped_titles = []

            # Build existing books set for deduplication (title+author, case-insensitive)
            existing_keys = set()
            if db is not None and user_id is not None:
                existing_cursor = db.books.find(
                    {"user_id": user_id},
                    {"title": 1, "author": 1, "language": 1}
                )
                async for book in existing_cursor:
                    key = (
                        (book.get("title") or "").strip().lower(),
                        (book.get("author") or "").strip().lower(),
                        (book.get("language") or "english").strip().lower()
                    )
                    existing_keys.add(key)

            for idx, entry in enumerate(data, start=1):
                try:
                    book = JSONHandler._validate_book_entry(entry, idx)

                    # Deduplication check
                    dup_key = (
                        (book.get("title") or "").strip().lower(),
                        (book.get("author") or "").strip().lower(),
                        (book.get("language") or "english").strip().lower()
                    )
                    
                    if dup_key in existing_keys:
                        skipped_titles.append(entry.get("title", "Unknown"))
                        errors.append({
                            "row": idx,
                            "error": f"Duplicate entry skipped (same title, author and book language already exists)",
                            "data": {"title": entry.get("title", "Unknown"), "author": entry.get("author", "Unknown"), "language": entry.get("language", "English")}
                        })
                        continue

                    existing_keys.add(dup_key)  # prevent duplicates within the file itself
                    valid_books.append(book)

                except ValueError as e:
                    errors.append({
                        "row": idx,
                        "error": str(e),
                        "data": {"title": entry.get("title", "Unknown"), "author": entry.get("author", "Unknown"), "language": entry.get("language", "English")}
                    })

            return valid_books, errors

        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON format: {str(e)}"
            )
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File encoding error. Please use UTF-8 encoding"
            )

    @staticmethod
    def _validate_book_entry(entry: Dict, row_num: int) -> Dict:
        """Validate and normalize a book entry"""

        if not entry.get("title"):
            raise ValueError("Missing required field: title")

        reading_started = entry.get("reading_started")
        reading_finished = entry.get("reading_finished")

        if reading_started:
            try:
                if isinstance(reading_started, str):
                    reading_started = datetime.fromisoformat(reading_started.replace('Z', '+00:00'))
            except (ValueError, TypeError):
                raise ValueError("Invalid date format for reading_started")
        else:
            reading_started = datetime.now(timezone.utc)

        if reading_finished:
            try:
                if isinstance(reading_finished, str):
                    reading_finished = datetime.fromisoformat(reading_finished.replace('Z', '+00:00'))
            except (ValueError, TypeError):
                raise ValueError("Invalid date format for reading_finished")

        if reading_finished and reading_started and reading_finished < reading_started:
            raise ValueError("Finish date cannot be before start date")

        rating = entry.get("rating", 0.0)
        try:
            rating = float(rating) if rating else 0.0
            if rating < 0 or rating > 5:
                raise ValueError("Rating must be between 0 and 5")
        except (ValueError, TypeError):
            rating = 0.0

        page_count = entry.get("page_count")
        if page_count:
            try:
                page_count = int(page_count)
                if page_count <= 0:
                    page_count = None
            except (ValueError, TypeError):
                page_count = None

        publication_year = entry.get("publication_year")
        if publication_year:
            try:
                publication_year = int(publication_year)
                current_year = datetime.now().year
                if publication_year < 1000 or publication_year > current_year:
                    publication_year = None
            except (ValueError, TypeError):
                publication_year = None

        valid_formats = ['paperback', 'hardcover', 'ebook', 'audiobook']
        book_format = entry.get("format")
        if book_format and book_format.lower() not in valid_formats:
            book_format = None

        return {
            "title": entry["title"].strip(),
            "author": entry.get("author", "").strip() if entry.get("author") else None,
            "isbn": entry.get("isbn", "").strip() if entry.get("isbn") else None,
            "genre": entry.get("genre", "").strip() if entry.get("genre") else None,
            "rating": rating,
            "description": entry.get("description", "").strip() if entry.get("description") else None,
            "cover_image": entry.get("cover_image", "").strip() if entry.get("cover_image") else None,
            "reading_started": reading_started,
            "reading_finished": reading_finished,
            "is_favorite": bool(entry.get("is_favorite", False)),
            "page_count": page_count,
            "publisher": entry.get("publisher", "").strip() if entry.get("publisher") else None,
            "publication_year": publication_year,
            "language": entry.get("language", "English").strip(),
            "format": book_format.lower() if book_format else None
        }

    @staticmethod
    def generate_export(books: List[Dict]) -> str:
        """Generate JSON export string"""

        export_data = []

        for book in books:
            export_book = {
                "id": book.get("id"),
                "title": book.get("title"),
                "author": book.get("author"),
                "isbn": book.get("isbn"),
                "genre": book.get("genre"),
                "rating": book.get("rating", 0.0),
                "description": book.get("description"),
                "cover_image": book.get("cover_image"),
                "reading_started": book.get("reading_started").isoformat() if book.get("reading_started") else None,
                "reading_finished": book.get("reading_finished").isoformat() if book.get("reading_finished") else None,
                "is_favorite": book.get("is_favorite", False),
                "page_count": book.get("page_count"),
                "publisher": book.get("publisher"),
                "publication_year": book.get("publication_year"),
                "language": book.get("language", "English"),
                "format": book.get("format"),
                "created_at": book.get("created_at").isoformat() if book.get("created_at") else None,
                "updated_at": book.get("updated_at").isoformat() if book.get("updated_at") else None
            }
            export_data.append(export_book)

        return json.dumps(export_data, indent=2, ensure_ascii=False)


class CSVHandler(FileHandler):
    """Handle CSV file operations"""

    CSV_HEADERS = [
        "title", "author", "isbn", "genre", "rating", "description", "cover_image",
        "reading_started", "reading_finished", "is_favorite", "page_count",
        "publisher", "publication_year", "language", "format", "created_at", "updated_at"
    ]

    @staticmethod
    async def parse_import(file: UploadFile, user_id=None, db=None) -> Tuple[List[Dict], List[Dict]]:
        """
        Parse CSV file for import
        Returns: (valid_books, errors)
        """
        await CSVHandler.validate_file_size(file)

        try:
            contents = await file.read()
            decoded_content = contents.decode('utf-8-sig')  # Handle BOM

            csv_reader = csv.DictReader(StringIO(decoded_content))

            if not csv_reader.fieldnames:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CSV file is empty or has no headers"
                )

            # Build existing books set for deduplication
            existing_keys = set()
            if db is not None and user_id is not None:
                existing_cursor = db.books.find(
                    {"user_id": user_id},
                    {"title": 1, "author": 1, "language": 1}
                )
                async for book in existing_cursor:
                    key = (
                        (book.get("title") or "").strip().lower(),
                        (book.get("author") or "").strip().lower(),
                        (book.get("language") or "english").strip().lower()
                    )
                    existing_keys.add(key)

            valid_books = []
            errors = []

            for idx, row in enumerate(csv_reader, start=2):
                try:
                    book = CSVHandler._validate_csv_row(row, idx)

                    dup_key = (
                        (book.get("title") or "").strip().lower(),
                        (book.get("author") or "").strip().lower(),
                        (book.get("language") or "english").strip().lower()
                    )

                    if dup_key in existing_keys:
                        errors.append({
                            "row": idx,
                            "error": "Duplicate entry skipped (same title, author, and book language already exists)",
                            "data": {"title": row.get("title", "Unknown"), "author": row.get("author", "Unknown"), "language": row.get("language", "English")}
                        })
                        continue

                    existing_keys.add(dup_key)
                    valid_books.append(book)

                except ValueError as e:
                    errors.append({
                        "row": idx,
                        "error": str(e),
                        "data": {"title": row.get("title", "Unknown"), "author": row.get("author", "Unknown"), "language": row.get("language", "English")}
                    })

            return valid_books, errors

        except UnicodeDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File encoding error. Please use UTF-8 encoding"
            )
        except csv.Error as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid CSV format: {str(e)}"
            )

    @staticmethod
    def _validate_csv_row(row: Dict, row_num: int) -> Dict:
        """Validate and normalize a CSV row"""

        title = row.get("title", "").strip()
        if not title:
            raise ValueError("Missing required field: title")

        reading_started = row.get("reading_started", "").strip()
        reading_finished = row.get("reading_finished", "").strip()

        if reading_started:
            try:
                reading_started = datetime.fromisoformat(reading_started.replace('Z', '+00:00'))
            except ValueError:
                try:
                    reading_started = datetime.strptime(reading_started, "%Y-%m-%d")
                    reading_started = reading_started.replace(tzinfo=timezone.utc)
                except ValueError:
                    raise ValueError(f"Invalid date format for reading_started: {reading_started}")
        else:
            reading_started = datetime.now(timezone.utc)

        if reading_finished:
            try:
                reading_finished = datetime.fromisoformat(reading_finished.replace('Z', '+00:00'))
            except ValueError:
                try:
                    reading_finished = datetime.strptime(reading_finished, "%Y-%m-%d")
                    reading_finished = reading_finished.replace(tzinfo=timezone.utc)
                except ValueError:
                    raise ValueError(f"Invalid date format for reading_finished: {reading_finished}")
        else:
            reading_finished = None

        if reading_finished and reading_finished < reading_started:
            raise ValueError("Finish date cannot be before start date")

        rating_str = row.get("rating", "0").strip()
        try:
            rating = float(rating_str) if rating_str else 0.0
            if rating < 0 or rating > 5:
                rating = 0.0
        except ValueError:
            rating = 0.0

        is_favorite_str = row.get("is_favorite", "").strip().lower()
        is_favorite = is_favorite_str in ['true', '1', 'yes', 'y']

        page_count = row.get("page_count", "").strip()
        if page_count:
            try:
                page_count = int(page_count)
                if page_count <= 0:
                    page_count = None
            except ValueError:
                page_count = None
        else:
            page_count = None

        publication_year = row.get("publication_year", "").strip()
        if publication_year:
            try:
                publication_year = int(publication_year)
                current_year = datetime.now().year
                if publication_year < 1000 or publication_year > current_year:
                    publication_year = None
            except ValueError:
                publication_year = None
        else:
            publication_year = None

        valid_formats = ['paperback', 'hardcover', 'ebook', 'audiobook']
        book_format = row.get("format", "").strip().lower()
        if book_format and book_format not in valid_formats:
            book_format = None

        # cover_image from CSV column (may be empty but we preserve it)
        cover_image = row.get("cover_image", "").strip() or None

        return {
            "title": title,
            "author": row.get("author", "").strip() or None,
            "isbn": row.get("isbn", "").strip() or None,
            "genre": row.get("genre", "").strip() or None,
            "rating": rating,
            "description": row.get("description", "").strip() or None,
            "cover_image": cover_image,
            "reading_started": reading_started,
            "reading_finished": reading_finished,
            "is_favorite": is_favorite,
            "page_count": page_count,
            "publisher": row.get("publisher", "").strip() or None,
            "publication_year": publication_year,
            "language": row.get("language", "English").strip() or "English",
            "format": book_format or None
        }

    @staticmethod
    def generate_export(books: List[Dict]) -> str:
        """Generate CSV export string"""

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=CSVHandler.CSV_HEADERS)

        writer.writeheader()

        for book in books:
            reading_started = book.get("reading_started")
            reading_finished = book.get("reading_finished")
            created_at = book.get("created_at")
            updated_at = book.get("updated_at")

            row = {
                "title": book.get("title", ""),
                "author": book.get("author", "") or "",
                "isbn": book.get("isbn", "") or "",
                "genre": book.get("genre", "") or "",
                "rating": book.get("rating", 0.0),
                "description": book.get("description", "") or "",
                "cover_image": book.get("cover_image", "") or "",
                "reading_started": reading_started.isoformat() if reading_started else "",
                "reading_finished": reading_finished.isoformat() if reading_finished else "",
                "is_favorite": str(book.get("is_favorite", False)).lower(),
                "page_count": book.get("page_count", "") if book.get("page_count") is not None else "",
                "publisher": book.get("publisher", "") or "",
                "publication_year": book.get("publication_year", "") if book.get("publication_year") is not None else "",
                "language": book.get("language", "English") or "English",
                "format": book.get("format", "") or "",
                "created_at": created_at.isoformat() if created_at else "",
                "updated_at": updated_at.isoformat() if updated_at else "",
            }
            writer.writerow(row)

        return output.getvalue()
    