from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ListingStatus(str, Enum):
    ACTIVE = "active"
    SOLD = "sold"
    INACTIVE = "inactive"

class ListingCategory(str, Enum):
    BOOKS = "Books"
    ELECTRONICS = "Electronics"
    FURNITURE = "Furniture"
    CLOTHING = "Clothing"
    SPORTS = "Sports"
    TRANSPORTATION = "Transportation"
    OTHER = "Other"

class ListingBase(BaseModel):
    title: str
    description: str
    price: float
    category: ListingCategory
    condition: Optional[str] = None
    pickup_location: Optional[str] = None
    stock: int = Field(..., ge=0, description="Stock quantity")
    images: Optional[List[str]] = []
    tags: Optional[List[str]] = []

class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    category: ListingCategory
    condition: Optional[str] = None
    pickup_location: Optional[str] = None
    stock: int = Field(..., ge=1, description="Stock quantity must be at least 1 when creating")
    images: Optional[List[str]] = []
    tags: Optional[List[str]] = []

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[ListingCategory] = None
    condition: Optional[str] = None
    pickup_location: Optional[str] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    is_sold: Optional[bool] = None
    is_hidden: Optional[bool] = None

class Listing(ListingBase):
    id: str
    seller_id: str
    buyer_ids: List[str] = []
    is_sold: bool = False
    is_reported: bool = False
    is_hidden: bool = False
    views: int = 0
    created_at: datetime
    updated_at: datetime
    seller_name: Optional[str] = None
    seller_email: Optional[str] = None
    average_rating: Optional[float] = None
    total_ratings: int = 0

    class Config:
        from_attributes = True

class ListingResponse(BaseModel):
    listings: List[Listing]
    total: int
    page: int
    per_page: int
    total_pages: int

class PurchaseRequest(BaseModel):
    quantity: int = Field(..., ge=1, description="Quantity to purchase (must be at least 1)")

class PurchaseResponse(BaseModel):
    listing_id: str
    quantity_purchased: int
    total_cost: float
    remaining_stock: int
    buyer_new_balance: float
    seller_new_balance: float
    transaction_id: str