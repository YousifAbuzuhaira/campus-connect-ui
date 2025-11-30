from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class RatingBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: str = Field(..., min_length=1, max_length=1000, description="Rating comment")

class RatingCreate(RatingBase):
    pass

class RatingUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: Optional[str] = Field(None, min_length=1, max_length=1000, description="Rating comment")

class Rating(RatingBase):
    id: str
    listing_id: str
    user_id: str
    user_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RatingResponse(BaseModel):
    ratings: list[Rating]
    total: int
    average_rating: Optional[float] = None
    total_ratings: int = 0