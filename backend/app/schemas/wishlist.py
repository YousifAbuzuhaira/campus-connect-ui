from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class PriceHistoryEntry(BaseModel):
    price: float
    changed_at: str


class WishlistItemListing(BaseModel):
    id: str
    title: str
    description: str
    price: float
    category: str
    condition: Optional[str] = None
    pickup_location: Optional[str] = None
    images: Optional[List[str]] = []
    is_sold: bool = False
    seller_id: str
    seller_name: Optional[str] = None
    created_at: str
    price_history: Optional[List[PriceHistoryEntry]] = []

    class Config:
        from_attributes = True


class WishlistItemResponse(BaseModel):
    id: str
    listing_id: str
    user_id: str
    saved_price: Optional[float] = None
    saved_at: str
    listing: Optional[WishlistItemListing] = None
    price_changed: bool = False
    current_price: Optional[float] = None

    class Config:
        from_attributes = True


class WishlistListResponse(BaseModel):
    items: List[WishlistItemResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class PriceDropItem(BaseModel):
    id: str
    listing_id: str
    user_id: str
    saved_price: float
    current_price: float
    price_difference: float
    percentage_drop: float
    saved_at: str
    listing: Optional[WishlistItemListing] = None

    class Config:
        from_attributes = True