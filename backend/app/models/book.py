from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class Book(BaseModel):
    """Book model"""
    
    id: PyObjectId | None = Field(alias="_id", default=None)
    user_id: PyObjectId
    title: str
    author: str | None = None
    isbn: str | None = None
    genre: str | None = None
    rating: float = 0.0
    description: str | None = None
    cover_image: str | None = None
    reading_started: datetime
    reading_finished: datetime | None = None
    is_favorite: bool = False
    page_count: int | None = None
    publisher: str | None = None
    publication_year: int | None = None
    language: str = "English"
    format: str | None = None
    created_at: datetime
    updated_at: datetime
    
    @field_validator('reading_finished')
    def validate_dates(cls, v, values):
        if v and 'reading_started' in values:
            if v < values['reading_started']:
                raise ValueError('Finish date cannot be before start date')
        return v
    
    @field_validator('format')
    def validate_format(cls, v):
        if v and v not in ['paperback', 'hardcover', 'ebook', 'audiobook', 'pdf']:
            raise ValueError('Invalid book format')
        return v
    
    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


class BookInDB(Book):
    """Book model as stored in database"""
    pass