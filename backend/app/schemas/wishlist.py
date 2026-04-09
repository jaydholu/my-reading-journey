from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal


# Request Schemas
class WishlistCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    author: str | None = Field(None, max_length=100)
    isbn: str | None = Field(None, max_length=20)
    genre: str | None = Field(None, max_length=50)
    priority: int = Field(1, ge=1, le=5)  # 1=low, 5=high
    notes: str | None = Field(None, max_length=1000)
    price: Decimal | None = Field(None, ge=0)
    where_to_buy: str | None = Field(None, max_length=200)


class WishlistUpdateRequest(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    author: str | None = Field(None, max_length=100)
    isbn: str | None = Field(None, max_length=20)
    genre: str | None = Field(None, max_length=50)
    priority: int | None = Field(None, ge=1, le=5)
    notes: str | None = Field(None, max_length=1000)
    price: Decimal | None = Field(None, ge=0)
    where_to_buy: str | None = Field(None, max_length=200)


# Response Schema
class WishlistResponse(BaseModel):
    id: str
    title: str
    author: str | None
    isbn: str | None
    genre: str | None
    priority: int
    notes: str | None
    price: Decimal | None
    where_to_buy: str | None
    created_at: datetime
    updated_at: datetime


class WishlistListResponse(BaseModel):
    wishlist: list[WishlistResponse]
    total: int
    page: int
    pages: int
    has_prev: bool
    has_next: bool
