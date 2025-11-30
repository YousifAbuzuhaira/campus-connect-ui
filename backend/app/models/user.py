from datetime import datetime
from bson import ObjectId
from typing import Optional, Dict, Any, List
import hashlib
import secrets

class UserModel:
    @staticmethod
    def user_helper(user: dict) -> dict:
        """Transform MongoDB document to API response format"""
        return {
            "id": str(user["_id"]),
            "university_id": user.get("universityId"),
            "email": user["email"],
            "username": user.get("userName", user.get("username")),
            "full_name": user.get("fullName", user.get("full_name")),
            "university": user.get("university"),
            "phone": user.get("phone"),
            "bio": user.get("bio"),
            "gender": user.get("gender"),
            "balance": user.get("balance", 100.0),
            "is_active": user.get("is_active", True),
            "is_banned": user.get("isBanned", False),
            "is_admin": user.get("isAdmin", False),
            "blocked_ids": [str(bid) for bid in user.get("blockedIds", [])],
            "created_at": user.get("createdAt", user.get("created_at", datetime.utcnow())),
            "updated_at": user.get("updatedAt", user.get("updated_at", datetime.utcnow())),
        }
    
    @staticmethod
    def create_user_dict(user_data: dict, hashed_password: str) -> dict:
        """Create user document for MongoDB insertion"""
        now = datetime.utcnow()
        return {
            "universityId": user_data.get("university_id"),
            "email": user_data["email"],
            "userName": user_data["username"],
            "fullName": user_data["full_name"],
            "university": user_data.get("university"),
            "phone": user_data.get("phone"),
            "bio": user_data.get("bio", ""),
            "gender": user_data.get("gender"),
            "balance": 100.0,
            "hashed_password": hashed_password,
            "is_active": True,
            "isBanned": False,
            "isAdmin": user_data.get("is_admin", False),
            "blockedIds": [],
            "createdAt": now,
            "updatedAt": now,
        }
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            # Split the stored hash to get salt and hash
            if ':' not in hashed_password:
                return False
            salt, stored_hash = hashed_password.split(':', 1)
            # Hash the provided password with the same salt
            password_hash = hashlib.pbkdf2_hmac('sha256', 
                                               plain_password.encode('utf-8'), 
                                               salt.encode('utf-8'), 
                                               100000)
            return secrets.compare_digest(password_hash.hex(), stored_hash)
        except Exception:
            return False
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password using PBKDF2 with SHA256"""
        # Generate a random salt
        salt = secrets.token_hex(32)
        # Hash the password with the salt
        password_hash = hashlib.pbkdf2_hmac('sha256', 
                                           password.encode('utf-8'), 
                                           salt.encode('utf-8'), 
                                           100000)
        # Return salt:hash format
        return f"{salt}:{password_hash.hex()}"
    
    @staticmethod
    def validate_object_id(id_string: str) -> bool:
        """Validate if string is a valid ObjectId"""
        try:
            ObjectId(id_string)
            return True
        except:
            return False