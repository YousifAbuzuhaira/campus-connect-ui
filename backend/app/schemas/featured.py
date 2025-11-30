from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .listing import Listing

class FeaturedProductBase(BaseModel):
    product_id: str
    order: int = 1
    featured: bool = True

class FeaturedProductCreate(FeaturedProductBase):
    pass

class FeaturedProduct(FeaturedProductBase):
    id: str
    created_at: datetime
    product: Optional[Listing] = None

    class Config:
        from_attributes = True

class HomePageData(BaseModel):
    featured_products: List[FeaturedProduct]
    recent_products: List[Listing]
    categories: List[dict]
    stats: dict

class CategoryStats(BaseModel):
    category: str
    count: int
    avg_price: float