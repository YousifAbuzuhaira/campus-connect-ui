from datetime import datetime
from bson import ObjectId
from typing import Optional, Tuple


class WishlistModel:
    
    @staticmethod
    def wishlist_helper(wishlist_item: dict) -> dict:
        """Transform MongoDB wishlist document to API response format"""
        return {
            "id": str(wishlist_item["_id"]),
            "listing_id": str(wishlist_item["listingId"]),
            "user_id": str(wishlist_item["userId"]),
            "saved_price": wishlist_item.get("savedPrice"),
            "saved_at": str(wishlist_item.get("createdAt", "")),
        }
    
    @staticmethod
    def create_wishlist_dict(user_id: str, listing_id: str, saved_price: float = None) -> dict:
        """Create wishlist document for MongoDB insertion.
        
        Field names use camelCase to match the indexes created in
        scripts/setup_wishlist_indexes.py:
          - userId (compound unique + recency index)
          - listingId (compound unique + popularity index)
          - createdAt (recency index sort key)
        """
        now = datetime.utcnow()
        return {
            "userId": ObjectId(user_id),
            "listingId": ObjectId(listing_id),
            "savedPrice": saved_price,
            "createdAt": now,
            "updatedAt": now,
        }
    
    @staticmethod
    def validate_object_id(id_string: str) -> bool:
        """Validate if string is a valid ObjectId"""
        try:
            ObjectId(id_string)
            return True
        except:
            return False
    
    @staticmethod
    async def get_save_count(saved_listings_collection, listing_id: str) -> int:
        """Get the number of users who have saved a specific listing"""
        try:
            count = await saved_listings_collection.count_documents(
                {"listingId": ObjectId(listing_id)}
            )
            return count
        except:
            return 0
    
    @staticmethod
    async def is_saved_by_user(saved_listings_collection, user_id: str, listing_id: str) -> bool:
        """Check if a listing is saved by a specific user"""
        try:
            existing = await saved_listings_collection.find_one({
                "userId": ObjectId(user_id),
                "listingId": ObjectId(listing_id)
            })
            return existing is not None
        except:
            return False