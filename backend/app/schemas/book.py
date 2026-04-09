from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


# Request Schemas
class BookCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    author: str | None = Field(None, max_length=100)
    isbn: str | None = Field(None, max_length=20)
    genre: str | None = Field(None, max_length=50)
    rating: float | None = Field(0.0, ge=0, le=5)
    description: str | None = Field(None, max_length=2000)
    reading_started: datetime
    reading_finished: datetime | None = None
    page_count: int | None = Field(None, gt=0)
    publisher: str | None = Field(None, max_length=100)
    publication_year: int | None = None
    language: str | None = Field("English", max_length=50)
    format: str | None = None
    

class BookUpdateRequest(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    author: str | None = Field(None, max_length=100)
    isbn: str | None = Field(None, max_length=20)
    genre: str | None = Field(None, max_length=50)
    rating: float | None = Field(None, ge=0, le=5)
    description: str | None = Field(None, max_length=2000)
    reading_started: datetime | None = None
    reading_finished: datetime | None = None
    is_favorite: bool | None = None
    page_count: int | None = Field(None, gt=0)
    publisher: str | None = Field(None, max_length=100)
    publication_year: int | None = None
    language: str | None = Field(None, max_length=50)
    format: str | None = None


class BookFilterParams(BaseModel):
    favorite: bool | None = None
    genre: str | None = None
    author: str | None = None
    rating_min: float | None = Field(None, ge=0, le=5)
    rating_max: float | None = Field(None, ge=0, le=5)
    year: int | None = None
    search: str | None = None  # Search in title/author
    sort: str | None = Field("date_desc")  # date_asc, date_desc, title_asc, title_desc, rating_desc
    page: int = Field(1, gt=0)
    limit: int = Field(20, gt=0, le=100)


# Response Schemas
class BookResponse(BaseModel):
    id: str
    title: str
    author: str | None
    isbn: str | None
    genre: str | None
    rating: float
    description: str | None
    cover_image: str | None
    reading_started: datetime
    reading_finished: datetime | None
    is_favorite: bool
    page_count: int | None
    publisher: str | None
    publication_year: int | None
    language: str
    format: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        model_config = ConfigDict(
            json_schema_extra={
                "example": {
                    "id": "507f1f77bcf86cd799439011",
                    "title": "The Great Gatsby",
                    "author": "F. Scott Fitzgerald",
                    "isbn": "9780743273565",
                    "genre": "Classic",
                    "rating": 4.5,
                    "description": "A classic American novel...",
                    "cover_image": "https://res.cloudinary.com/...",
                    "reading_started": "2025-01-15T00:00:00Z",
                    "reading_finished": "2025-02-01T00:00:00Z",
                    "is_favorite": True,
                    "page_count": 180,
                    "publisher": "Scribner",
                    "publication_year": 1925,
                    "language": "English",
                    "format": "paperback",
                    "created_at": "2025-01-15T10:30:00Z",
                    "updated_at": "2025-02-01T15:45:00Z"
                }
            }
        )


class BooksListResponse(BaseModel):
    books: list[BookResponse]
    total: int
    page: int
    pages: int
    has_next: bool
    has_prev: bool


class BookStatsResponse(BaseModel):
    average_rating: float
    books_by_genre: dict
    books_by_year: dict
    books_finished: int
    books_rated_count: int
    books_reading: int
    favorite_books: int
    total_books: int
    total_pages: int
    wishlist_count: int = 0
    