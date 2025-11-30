from fastapi import APIRouter, Depends
from typing import List, Optional

from app.database import (
    get_featured_products_collection,
    get_listings_collection,
    get_users_collection
)
from app.models.featured import FeaturedProductModel
from app.models.listing import ListingModel
from app.schemas.featured import HomePageData, FeaturedProduct, CategoryStats
from app.schemas.listing import Listing
from app.schemas.user import User
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=HomePageData)
async def get_home_page_data(
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get data for home page including featured products, recent listings, and stats"""
    featured_collection = await get_featured_products_collection()
    listings_collection = await get_listings_collection()
    users_collection = await get_users_collection()
    
    # Get featured products
    featured_products = []
    cursor = featured_collection.find({"featured": True}).sort("order", 1).limit(6)
    async for featured in cursor:
        featured_data = FeaturedProductModel.featured_product_helper(featured)
        
        # Get the actual product details
        product = await listings_collection.find_one({
            "_id": featured["productId"],
            "isHidden": False,
            "isSold": False
        })
        
        if product:
            product_data = ListingModel.listing_helper(product)
            
            # Get seller info
            seller = await users_collection.find_one({"_id": product["sellerId"]})
            if seller:
                product_data["seller_name"] = seller.get("fullName")
                product_data["seller_email"] = seller.get("email")
            
            featured_data["product"] = product_data
            featured_products.append(featured_data)
    
    # Get recent products (last 10 active listings)
    recent_products = []
    recent_cursor = listings_collection.find({
        "isHidden": False,
        "isSold": False
    }).sort("createdAt", -1).limit(10)
    
    async for product in recent_cursor:
        product_data = ListingModel.listing_helper(product)
        
        # Get seller info
        seller = await users_collection.find_one({"_id": product["sellerId"]})
        if seller:
            product_data["seller_name"] = seller.get("fullName")
            product_data["seller_email"] = seller.get("email")
        
        recent_products.append(product_data)
    
    # Get category statistics
    category_stats = []
    categories_pipeline = [
        {"$match": {"isHidden": False, "isSold": False}},
        {
            "$group": {
                "_id": "$category",
                "count": {"$sum": 1},
                "avgPrice": {"$avg": "$price"}
            }
        },
        {"$sort": {"count": -1}}
    ]
    
    async for category in listings_collection.aggregate(categories_pipeline):
        category_stats.append({
            "category": category["_id"],
            "count": category["count"],
            "avg_price": round(category["avgPrice"], 2)
        })
    
    # Get general stats
    total_products = await listings_collection.count_documents({"isHidden": False})
    active_products = await listings_collection.count_documents({"isHidden": False, "isSold": False})
    total_users = await users_collection.count_documents({"is_active": True})
    
    stats = {
        "total_products": total_products,
        "active_products": active_products,
        "total_users": total_users,
        "categories_count": len(category_stats)
    }
    
    return HomePageData(
        featured_products=featured_products,
        recent_products=recent_products,
        categories=category_stats,
        stats=stats
    )

@router.get("/categories", response_model=List[CategoryStats])
async def get_category_stats():
    """Get statistics for all product categories"""
    listings_collection = await get_listings_collection()
    
    pipeline = [
        {"$match": {"isHidden": False, "isSold": False}},
        {
            "$group": {
                "_id": "$category",
                "count": {"$sum": 1},
                "avgPrice": {"$avg": "$price"}
            }
        },
        {"$sort": {"count": -1}}
    ]
    
    categories = []
    async for category in listings_collection.aggregate(pipeline):
        categories.append(CategoryStats(
            category=category["_id"],
            count=category["count"],
            avg_price=round(category["avgPrice"], 2)
        ))
    
    return categories