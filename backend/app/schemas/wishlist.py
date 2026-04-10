from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from decimal import Decimal
from enum import Enum


class AcquisitionType(str, Enum):
    buy_online = "buy_online"
    already_purchased = "already_purchased"
    borrowed = "borrowed"


# Request Schemas
class WishlistCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    author: str | None = Field(None, max_length=100)
    isbn: str | None = Field(None, max_length=20)
    genre: str | None = Field(None, max_length=50)
    priority: int = Field(1, ge=1, le=5)  # 1=low, 5=high
    notes: str | None = Field(None, max_length=1000)
    price: Decimal | None = Field(None, ge=0)
    acquisition_type: AcquisitionType = Field(default=AcquisitionType.buy_online)
    where_to_buy: str | None = Field(None, max_length=200)
    borrowed_from: str | None = Field(None, max_length=200)


class WishlistUpdateRequest(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    author: str | None = Field(None, max_length=100)
    isbn: str | None = Field(None, max_length=20)
    genre: str | None = Field(None, max_length=50)
    priority: int | None = Field(None, ge=1, le=5)
    notes: str | None = Field(None, max_length=1000)
    price: Decimal | None = Field(None, ge=0)
    acquisition_type: AcquisitionType | None = Field(None)
    where_to_buy: str | None = Field(None, max_length=200)
    borrowed_from: str | None = Field(None, max_length=200)


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
    acquisition_type: str | None = None  # str to handle old data gracefully
    where_to_buy: str | None
    borrowed_from: str | None = None
    created_at: datetime
    updated_at: datetime


class WishlistListResponse(BaseModel):
    wishlist: list[WishlistResponse]
    total: int
    page: int
    pages: int
    has_prev: bool
    has_next: bool
