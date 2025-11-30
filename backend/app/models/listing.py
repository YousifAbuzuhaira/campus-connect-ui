from datetime import datetime
from bson import ObjectId
from typing import Optional, Dict, Any, List

class ListingModel:
    # Category mapping - now both database and schema use the same capitalized values
    CATEGORY_MAPPING = {
        # Standard capitalized categories (database matches schema)
        "Books": "Books",
        "Electronics": "Electronics",
        "Furniture": "Furniture",
        "Clothing": "Clothing",
        "Sports": "Sports",
        "Transportation": "Transportation",
        "Other": "Other",
        
        # Legacy mappings for any old lowercase data that might still exist
        "books": "Books",
        "electronics": "Electronics",
        "furniture": "Furniture",
        "clothing": "Clothing",
        "sports": "Sports",
        "transportation": "Transportation",
        "other": "Other",
        
        # Legacy textbooks mapping
        "Textbooks": "Books",
        "textbooks": "Books"
    }
    
    # Reverse mapping is now 1:1 since database and schema use same format
    REVERSE_CATEGORY_MAPPING = {
        "Books": "Books",
        "Electronics": "Electronics",
        "Furniture": "Furniture",
        "Clothing": "Clothing",
        "Sports": "Sports",
        "Transportation": "Transportation",
        "Other": "Other"
    }
    
    @staticmethod
    def map_category_to_db(schema_category: str) -> str:
        """Map schema category value to database category value"""
        return ListingModel.REVERSE_CATEGORY_MAPPING.get(schema_category, "Other")

    @staticmethod
    async def listing_helper(listing: dict, users_collection=None, ratings_collection=None) -> dict:
        """Transform MongoDB document to API response format"""
        # Get category (with fallback mapping for any legacy data)
        db_category = listing["category"]
        mapped_category = ListingModel.CATEGORY_MAPPING.get(db_category, "Other")
        
        # Fetch current seller name from users collection if available
        seller_name = listing.get("seller_name", "Anonymous User")
        if users_collection is not None and "sellerId" in listing:
            try:
                user = await users_collection.find_one({"_id": listing["sellerId"]})
                if user:
                    seller_name = user.get("fullName", user.get("full_name", seller_name))
            except:
                pass  # Use the stored seller_name if fetch fails
        
        # Calculate average rating if ratings collection is provided
        average_rating = None
        total_ratings = 0
        if ratings_collection is not None:
            try:
                from app.models.rating import RatingModel
                average_rating, total_ratings = await RatingModel.calculate_listing_average_rating(
                    ratings_collection, str(listing["_id"])
                )
            except:
                pass  # Use defaults if rating calculation fails
        
        return {
            "id": str(listing["_id"]),
            "seller_id": str(listing["sellerId"]),
            "title": listing["title"],
            "description": listing["description"],
            "price": listing["price"],
            "category": mapped_category,
            "condition": listing.get("condition"),
            "pickup_location": listing.get("pickupLocation"),
            "stock": listing.get("stock", 1),
            "buyer_ids": [str(bid) for bid in listing.get("buyerIds", [])],
            "is_sold": listing.get("isSold", False),
            "is_reported": listing.get("isReported", False),
            "is_hidden": listing.get("isHidden", False),
            "images": listing.get("images", []),
            "tags": listing.get("tags", []),
            "views": listing.get("views", 0),
            "created_at": str(listing.get("createdAt", listing.get("created_at", datetime.utcnow()))),
            "updated_at": str(listing.get("updatedAt", listing.get("updated_at", datetime.utcnow()))),
            "seller_email": listing.get("seller_email"),
            "seller_name": seller_name,
            "average_rating": average_rating,
            "total_ratings": total_ratings,
        }
    
    @staticmethod
    def create_listing_dict(listing_data: dict, user_id: str, user_email: str = None, user_name: str = None) -> dict:
        """Create listing document for MongoDB insertion"""
        now = datetime.utcnow()
        # Category now matches between schema and database (both capitalized)
        category = listing_data["category"]
        
        return {
            "sellerId": ObjectId(user_id),
            "title": listing_data["title"],
            "description": listing_data["description"],
            "price": float(listing_data["price"]),
            "category": category,
            "condition": listing_data.get("condition"),
            "pickupLocation": listing_data.get("pickup_location"),
            "stock": listing_data["stock"],  # Now required, no default
            "buyerIds": [],
            "isSold": False,
            "isReported": False,
            "isHidden": False,
            "images": listing_data.get("images", []),
            "tags": listing_data.get("tags", []),
            "views": 0,
            "createdAt": now,
            "updatedAt": now,
            "seller_email": user_email,
            "seller_name": user_name,
        }
    
    @staticmethod
    def update_listing_dict(listing_data: dict) -> dict:
        """Create update document for MongoDB update"""
        update_data = {}
        
        if "title" in listing_data:
            update_data["title"] = listing_data["title"]
        if "description" in listing_data:
            update_data["description"] = listing_data["description"]
        if "price" in listing_data:
            update_data["price"] = float(listing_data["price"])
        if "category" in listing_data:
            # Map category from schema value to database value
            schema_category = listing_data["category"]
            db_category = ListingModel.map_category_to_db(schema_category)
            update_data["category"] = db_category
        if "condition" in listing_data:
            update_data["condition"] = listing_data["condition"]
        if "pickup_location" in listing_data:
            update_data["pickupLocation"] = listing_data["pickup_location"]
        if "stock" in listing_data:
            update_data["stock"] = listing_data["stock"]
        if "images" in listing_data:
            update_data["images"] = listing_data["images"]
        if "tags" in listing_data:
            update_data["tags"] = listing_data["tags"]
        if "is_sold" in listing_data:
            update_data["isSold"] = listing_data["is_sold"]
        if "is_hidden" in listing_data:
            update_data["isHidden"] = listing_data["is_hidden"]
            
        update_data["updatedAt"] = datetime.utcnow()
        return update_data
    
    @staticmethod
    def validate_object_id(id_string: str) -> bool:
        """Validate if string is a valid ObjectId"""
        try:
            ObjectId(id_string)
            return True
        except:
            return False