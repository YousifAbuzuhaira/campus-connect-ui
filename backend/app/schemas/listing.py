from pydantic import BaseModel, Field, validator
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

# Enums for sorting options
class ListingSortBy(str, Enum):
    """Defines the fields by which listings can be sorted."""
    PRICE = "price"
    DATE_POSTED = "created_at"
    VIEWS = "views"
    RELEVANCE = "relevance" # Typically used with search queries, implying a score
    AVERAGE_RATING = "average_rating"

class SortOrder(str, Enum):
    """Defines the order for sorting."""
    ASC = "asc"
    DESC = "desc"

class ListingSearchParams(BaseModel):
    """
    Parameters for comprehensive searching, filtering, and sorting of listings.
    This model is designed to be used as query parameters for listing retrieval endpoints.
    """
    search_query: Optional[str] = Field(None, description="Full-text search query across listing titles and descriptions.")
    category: Optional[ListingCategory] = Field(None, description="Filter listings by a specific category.")
    min_price: Optional[float] = Field(None, ge=0, description="Minimum price for filtering listings.")
    max_price: Optional[float] = Field(None, ge=0, description="Maximum price for filtering listings.")
    condition: Optional[str] = Field(None, description="Filter listings by item condition (e.g., 'New', 'Used - Like New').")
    pickup_location: Optional[str] = Field(None, description="Filter listings by a specific pickup location.")
    tags: Optional[List[str]] = Field(None, description="Filter listings that include any of the specified tags.")
    seller_id: Optional[str] = Field(None, description="Filter listings posted by a specific seller ID.")
    status: Optional[ListingStatus] = Field(ListingStatus.ACTIVE, description="Filter listings by their current status (e.g., 'active', 'sold'). Defaults to 'active'.")

    # Sorting parameters
    sort_by: ListingSortBy = Field(ListingSortBy.DATE_POSTED, description="Field to sort listings by. Defaults to 'created_at'.")
    sort_order: SortOrder = Field(SortOrder.DESC, description="Sort order: 'asc' for ascending, 'desc' for descending. Defaults to 'desc'.")

    # Pagination parameters
    page: int = Field(1, ge=1, description="Page number for pagination. Defaults to 1.")
    per_page: int = Field(10, ge=1, le=100, description="Number of items per page. Must be between 1 and 100. Defaults to 10.")

    @validator('max_price')
    def validate_price_range(cls, v: Optional[float], values: dict) -> Optional[float]:
        """
        Ensures that if both min_price and max_price are provided, max_price is not less than min_price.
        """
        min_price = values.get('min_price')
        if v is not None and min_price is not None and v < min_price:
            raise ValueError('max_price cannot be less than min_price')
        return v

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