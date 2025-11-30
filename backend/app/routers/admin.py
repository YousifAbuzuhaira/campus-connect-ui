from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from typing import List, Optional
from datetime import datetime

from app.database import get_users_collection, get_listings_collection
from app.models.user import UserModel
from app.models.listing import ListingModel
from app.schemas.user import User
from app.schemas.listing import Listing
from app.schemas.response import SuccessResponse
from app.routers.auth import get_current_user

router = APIRouter()

async def get_admin_user(current_user: User = Depends(get_current_user)):
    """Dependency to ensure the current user is an admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.get("/users", response_model=List[User])
async def get_all_users(
    admin_user: User = Depends(get_admin_user),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by username or email"),
    is_banned: Optional[bool] = Query(None, description="Filter by banned status")
):
    """Get all users with pagination and filters (admin only)"""
    users_collection = await get_users_collection()
    
    # Build query
    query = {}
    if search:
        query["$or"] = [
            {"userName": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"fullName": {"$regex": search, "$options": "i"}}
        ]
    if is_banned is not None:
        query["isBanned"] = is_banned
    
    # Get total count
    total_users = await users_collection.count_documents(query)
    
    # Get paginated users
    skip = (page - 1) * per_page
    users_cursor = users_collection.find(query).skip(skip).limit(per_page).sort("createdAt", -1)
    users = await users_cursor.to_list(length=per_page)
    
    return [UserModel.user_helper(user) for user in users]

@router.get("/users/{user_id}/profile", response_model=User)
async def get_user_profile(
    user_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Get any user's profile (admin only)"""
    if not UserModel.validate_object_id(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    users_collection = await get_users_collection()
    
    # Get user
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserModel.user_helper(user)

@router.post("/users/{user_id}/ban", response_model=SuccessResponse)
async def ban_user(
    user_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Ban a user (admin only)"""
    if not UserModel.validate_object_id(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    users_collection = await get_users_collection()
    
    # Check if user exists
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from banning themselves
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot ban yourself"
        )
    
    # Prevent banning other admins
    if user.get("isAdmin", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot ban other admins"
        )
    
    # Ban the user
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "isBanned": True,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 1:
        return SuccessResponse(
            message="User banned successfully",
            data={"user_id": user_id}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to ban user"
    )

@router.post("/users/{user_id}/unban", response_model=SuccessResponse)
async def unban_user(
    user_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Unban a user (admin only)"""
    if not UserModel.validate_object_id(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    users_collection = await get_users_collection()
    
    # Check if user exists
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Unban the user
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "isBanned": False,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 1:
        return SuccessResponse(
            message="User unbanned successfully",
            data={"user_id": user_id}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to unban user"
    )

@router.delete("/users/{user_id}", response_model=SuccessResponse)
async def delete_user_account(
    user_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Permanently delete a user account and all their data (admin only)"""
    if not UserModel.validate_object_id(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    users_collection = await get_users_collection()
    listings_collection = await get_listings_collection()
    
    # Check if user exists
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Prevent deleting other admins
    if user.get("isAdmin", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete other admin accounts"
        )
    
    # Delete all user's listings
    await listings_collection.delete_many({"sellerId": ObjectId(user_id)})
    
    # Delete the user account
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 1:
        return SuccessResponse(
            message="User account and all associated data deleted successfully",
            data={"user_id": user_id}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to delete user account"
    )

@router.get("/listings", response_model=List[Listing])
async def get_all_listings(
    admin_user: User = Depends(get_admin_user),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by title"),
    include_hidden: bool = Query(False, description="Include hidden listings")
):
    """Get all listings including hidden ones (admin only)"""
    listings_collection = await get_listings_collection()
    users_collection = await get_users_collection()
    
    # Build query
    query = {}
    if not include_hidden:
        query["isHidden"] = False
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    # Get paginated listings
    skip = (page - 1) * per_page
    listings_cursor = listings_collection.find(query).skip(skip).limit(per_page).sort("createdAt", -1)
    listings = await listings_cursor.to_list(length=per_page)
    
    # Enrich with seller information
    enriched_listings = []
    for listing in listings:
        # Get seller information
        seller = await users_collection.find_one({"_id": listing["sellerId"]})
        if seller:
            listing_data = await ListingModel.listing_helper(listing)
            listing_data["seller"] = UserModel.user_helper(seller)
            enriched_listings.append(listing_data)
    
    return enriched_listings

@router.delete("/listings/{listing_id}", response_model=SuccessResponse)
async def delete_listing(
    listing_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Permanently delete a listing (admin only)"""
    if not UserModel.validate_object_id(listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID"
        )
    
    listings_collection = await get_listings_collection()
    
    # Check if listing exists
    listing = await listings_collection.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Delete the listing
    result = await listings_collection.delete_one({"_id": ObjectId(listing_id)})
    
    if result.deleted_count == 1:
        return SuccessResponse(
            message="Listing deleted successfully",
            data={"listing_id": listing_id}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to delete listing"
    )

@router.get("/stats", response_model=dict)
async def get_admin_stats(admin_user: User = Depends(get_admin_user)):
    """Get admin dashboard statistics"""
    users_collection = await get_users_collection()
    listings_collection = await get_listings_collection()
    
    # Get user statistics
    total_users = await users_collection.count_documents({})
    banned_users = await users_collection.count_documents({"isBanned": True})
    active_users = await users_collection.count_documents({"is_active": True, "isBanned": False})
    
    # Get listing statistics
    total_listings = await listings_collection.count_documents({})
    active_listings = await listings_collection.count_documents({"isSold": False, "isHidden": False})
    sold_listings = await listings_collection.count_documents({"isSold": True})
    hidden_listings = await listings_collection.count_documents({"isHidden": True})
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "banned": banned_users
        },
        "listings": {
            "total": total_listings,
            "active": active_listings,
            "sold": sold_listings,
            "hidden": hidden_listings
        }
    }