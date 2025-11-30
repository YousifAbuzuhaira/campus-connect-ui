from datetime import datetime
from bson import ObjectId
from typing import Optional, Dict, Any, List

class RatingModel:
    @staticmethod
    async def rating_helper(rating: dict) -> dict:
        """Transform MongoDB document to API response format"""
        return {
            "id": str(rating["_id"]),
            "listing_id": str(rating["listingId"]),
            "user_id": str(rating["userId"]),
            "rating": rating["rating"],
            "comment": rating["comment"],
            "user_name": rating.get("userName", "Anonymous"),
            "created_at": str(rating.get("createdAt", datetime.utcnow())),
            "updated_at": str(rating.get("updatedAt", datetime.utcnow()))
        }
    
    @staticmethod
    def create_rating_dict(rating_data: dict, user_id: str, listing_id: str, user_name: str = None) -> dict:
        """Create rating document for MongoDB insertion"""
        now = datetime.utcnow()
        
        return {
            "listingId": ObjectId(listing_id),
            "userId": ObjectId(user_id),
            "rating": int(rating_data["rating"]),
            "comment": rating_data["comment"],
            "userName": user_name or "Anonymous",
            "createdAt": now,
            "updatedAt": now
        }
    
    @staticmethod
    def update_rating_dict(rating_data: dict) -> dict:
        """Create update document for MongoDB update"""
        update_data = {}
        
        if "rating" in rating_data:
            update_data["rating"] = int(rating_data["rating"])
        if "comment" in rating_data:
            update_data["comment"] = rating_data["comment"]
            
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
    
    @staticmethod
    async def calculate_listing_average_rating(ratings_collection, listing_id: str) -> Optional[float]:
        """Calculate average rating for a listing"""
        try:
            pipeline = [
                {"$match": {"listingId": ObjectId(listing_id)}},
                {"$group": {
                    "_id": None,
                    "average_rating": {"$avg": "$rating"},
                    "total_ratings": {"$sum": 1}
                }}
            ]
            
            result = await ratings_collection.aggregate(pipeline).to_list(1)
            if result:
                return round(result[0]["average_rating"], 1), result[0]["total_ratings"]
            return None, 0
        except:
            return None, 0