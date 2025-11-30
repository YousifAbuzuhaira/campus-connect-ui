from datetime import datetime
from bson import ObjectId
from typing import Optional, Dict, Any

class FeaturedProductModel:
    @staticmethod
    def featured_product_helper(featured: dict) -> dict:
        """Transform MongoDB document to API response format"""
        return {
            "id": str(featured["_id"]),
            "product_id": str(featured["productId"]),
            "featured": featured.get("featured", True),
            "order": featured.get("order", 1),
            "created_at": featured.get("createdAt", datetime.utcnow()),
        }
    
    @staticmethod
    def create_featured_product_dict(product_id: str, order: int = 1) -> dict:
        """Create featured product document for MongoDB insertion"""
        now = datetime.utcnow()
        return {
            "productId": ObjectId(product_id),
            "featured": True,
            "order": order,
            "createdAt": now,
        }
    
    @staticmethod
    def validate_object_id(id_string: str) -> bool:
        """Validate if string is a valid ObjectId"""
        try:
            ObjectId(id_string)
            return True
        except:
            return False