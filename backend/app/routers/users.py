from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from typing import List
from datetime import datetime

from app.database import get_users_collection
from app.models.user import UserModel
from app.schemas.user import User, UserUpdate, AddFundsRequest
from app.schemas.response import SuccessResponse
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/profile", response_model=User)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    # Prevent admins from accessing profile
    if current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot access user profile"
        )
    return current_user

@router.put("/profile", response_model=SuccessResponse)
async def update_user_profile(
    user_update: UserUpdate, 
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile"""
    # Prevent admins from updating profile
    if current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot update user profile"
        )
    users_collection = await get_users_collection()
    
    # Prepare update data - convert from snake_case schema to camelCase MongoDB format
    update_data = {}
    if user_update.email is not None:
        # Check if email is already taken by another user
        existing_user = await users_collection.find_one({
            "email": user_update.email,
            "_id": {"$ne": ObjectId(current_user.id)}
        })
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
        update_data["email"] = user_update.email
    
    if user_update.username is not None:
        # Check if username is already taken by another user
        existing_user = await users_collection.find_one({
            "userName": user_update.username,
            "_id": {"$ne": ObjectId(current_user.id)}
        })
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        update_data["userName"] = user_update.username
    
    # Handle full_name from either full_name field or combined firstName/lastName
    if user_update.full_name is not None:
        update_data["fullName"] = user_update.full_name
    elif user_update.firstName is not None or user_update.lastName is not None:
        first_name = user_update.firstName or current_user.full_name.split()[0] if current_user.full_name else ""
        last_name = user_update.lastName or (current_user.full_name.split()[1] if len(current_user.full_name.split()) > 1 else "")
        update_data["fullName"] = f"{first_name} {last_name}".strip()
    
    if user_update.university is not None:
        update_data["university"] = user_update.university
    
    # Handle phone from either phone or phoneNumber
    phone_value = user_update.phone or user_update.phoneNumber
    if phone_value is not None:
        update_data["phone"] = phone_value
    
    if user_update.bio is not None:
        update_data["bio"] = user_update.bio
    if user_update.gender is not None:
        update_data["gender"] = user_update.gender
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    update_data["updatedAt"] = datetime.utcnow()
    
    # Update user
    result = await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    if result.modified_count:
        return SuccessResponse(
            message="Profile updated successfully",
            data={"updated_fields": list(update_data.keys())}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to update profile"
    )

# Profile routes - must come before general /{user_id} route
@router.get("/{user_id}/profile", response_model=dict)
async def get_public_user_profile(user_id: str):
    """Get public user profile information"""
    from app.database import get_listings_collection, get_ratings_collection
    
    users_collection = await get_users_collection()
    listings_collection = await get_listings_collection()
    ratings_collection = await get_ratings_collection()
    
    # Get user info
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    user = await users_collection.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's active listings
    user_listings_cursor = listings_collection.find({
        "sellerId": user_obj_id,
        "isHidden": {"$ne": True},
        "isReported": {"$ne": True}
    }).sort("createdAt", -1)
    
    user_listings = []
    async for listing_doc in user_listings_cursor:
        from app.models.listing import ListingModel
        listing_data = await ListingModel.listing_helper(
            listing_doc, users_collection, ratings_collection
        )
        user_listings.append(listing_data)
    
    # Calculate seller statistics
    total_listings = len(user_listings)
    active_listings = len([l for l in user_listings if not l["is_sold"]])
    sold_listings = len([l for l in user_listings if l["is_sold"]])
    
    # Calculate average rating as a seller (ratings on their listings)
    listing_ids = [ObjectId(listing["id"]) for listing in user_listings]
    
    total_rating = 0
    rating_count = 0
    
    if listing_ids:
        ratings_cursor = ratings_collection.find({"listingId": {"$in": listing_ids}})
        async for rating in ratings_cursor:
            total_rating += rating.get("rating", 0)
            rating_count += 1
    
    average_seller_rating = round(total_rating / rating_count, 1) if rating_count > 0 else None
    
    # Return public profile data
    return {
        "user": {
            "id": str(user["_id"]),
            "username": user.get("userName", user.get("username")),
            "full_name": user.get("fullName", user.get("full_name")),
            "university": user.get("university"),
            "bio": user.get("bio", ""),
            "created_at": user.get("createdAt", user.get("created_at")),
        },
        "statistics": {
            "total_listings": total_listings,
            "active_listings": active_listings,
            "sold_listings": sold_listings,
            "average_rating": average_seller_rating,
            "total_ratings": rating_count
        },
        "listings": user_listings
    }

@router.get("/{user_id}/listings", response_model=List[dict])
async def get_user_listings(user_id: str):
    """Get all listings by a specific user"""
    from app.database import get_listings_collection, get_ratings_collection
    
    users_collection = await get_users_collection()
    listings_collection = await get_listings_collection()
    ratings_collection = await get_ratings_collection()
    
    # Validate user ID
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    # Check if user exists
    user = await users_collection.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's active listings
    user_listings_cursor = listings_collection.find({
        "sellerId": user_obj_id,
        "isHidden": {"$ne": True},
        "isReported": {"$ne": True}
    }).sort("createdAt", -1)
    
    user_listings = []
    async for listing_doc in user_listings_cursor:
        from app.models.listing import ListingModel
        listing_data = await ListingModel.listing_helper(
            listing_doc, users_collection, ratings_collection
        )
        user_listings.append(listing_data)
    
    return user_listings

@router.get("/{user_id}", response_model=User)
async def get_user_by_id(user_id: str):
    """Get user by ID (public profile)"""
    if not UserModel.validate_object_id(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    users_collection = await get_users_collection()
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserModel.user_helper(user)

@router.delete("/account", response_model=SuccessResponse)
async def delete_user_account(current_user: User = Depends(get_current_user)):
    """Delete current user's account"""
    users_collection = await get_users_collection()
    
    result = await users_collection.delete_one({"_id": ObjectId(current_user.id)})
    
    if result.deleted_count:
        return SuccessResponse(
            message="Account deleted successfully"
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to delete account"
    )

@router.get("/balance", response_model=SuccessResponse)
async def get_user_balance(current_user: User = Depends(get_current_user)):
    """Get current user's balance"""
    return SuccessResponse(
        message="Balance retrieved successfully",
        data={"balance": current_user.balance}
    )

@router.post("/add-funds", response_model=SuccessResponse)
async def add_funds(
    funds_request: AddFundsRequest,
    current_user: User = Depends(get_current_user)
):
    """Add funds to current user's account"""
    # Prevent admins from adding funds
    if current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot add funds"
        )
    
    users_collection = await get_users_collection()
    
    # Get current balance from database to ensure accuracy
    user_doc = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    current_balance = user_doc.get("balance", 100.0)
    new_balance = current_balance + funds_request.amount
    
    # Update user balance
    result = await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {
            "$set": {
                "balance": new_balance,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count:
        return SuccessResponse(
            message="Funds added successfully",
            data={
                "amount_added": funds_request.amount,
                "new_balance": new_balance,
                "previous_balance": current_balance
            }
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to add funds"
    )

@router.get("/{user_id}/profile", response_model=dict)
async def get_public_user_profile(user_id: str):
    """Get public user profile information"""
    from app.database import get_listings_collection, get_ratings_collection
    
    users_collection = await get_users_collection()
    listings_collection = await get_listings_collection()
    ratings_collection = await get_ratings_collection()
    
    # Get user info
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    user = await users_collection.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's active listings
    user_listings_cursor = listings_collection.find({
        "sellerId": user_obj_id,
        "isHidden": {"$ne": True},
        "isReported": {"$ne": True}
    }).sort("createdAt", -1)
    
    user_listings = []
    async for listing_doc in user_listings_cursor:
        from app.models.listing import ListingModel
        listing_data = await ListingModel.listing_helper(
            listing_doc, users_collection, ratings_collection
        )
        user_listings.append(listing_data)
    
    # Calculate seller statistics
    total_listings = len(user_listings)
    active_listings = len([l for l in user_listings if not l["is_sold"]])
    sold_listings = len([l for l in user_listings if l["is_sold"]])
    
    # Calculate average rating as a seller (ratings on their listings)
    listing_ids = [ObjectId(listing["id"]) for listing in user_listings]
    
    total_rating = 0
    rating_count = 0
    
    if listing_ids:
        ratings_cursor = ratings_collection.find({"listingId": {"$in": listing_ids}})
        async for rating in ratings_cursor:
            total_rating += rating.get("rating", 0)
            rating_count += 1
    
    average_seller_rating = round(total_rating / rating_count, 1) if rating_count > 0 else None
    
    # Return public profile data
    return {
        "user": {
            "id": str(user["_id"]),
            "username": user.get("userName", user.get("username")),
            "full_name": user.get("fullName", user.get("full_name")),
            "university": user.get("university"),
            "bio": user.get("bio", ""),
            "created_at": user.get("createdAt", user.get("created_at")),
        },
        "statistics": {
            "total_listings": total_listings,
            "active_listings": active_listings,
            "sold_listings": sold_listings,
            "average_rating": average_seller_rating,
            "total_ratings": rating_count
        },
        "listings": user_listings
    }

@router.get("/{user_id}/listings", response_model=List[dict])
async def get_user_listings(user_id: str):
    """Get all public listings by a specific user"""
    from app.database import get_listings_collection, get_ratings_collection
    
    users_collection = await get_users_collection()
    listings_collection = await get_listings_collection()
    ratings_collection = await get_ratings_collection()
    
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    # Check if user exists
    user = await users_collection.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's public listings
    listings_cursor = listings_collection.find({
        "sellerId": user_obj_id,
        "isHidden": {"$ne": True},
        "isReported": {"$ne": True}
    }).sort("createdAt", -1)
    
    listings = []
    async for listing_doc in listings_cursor:
        from app.models.listing import ListingModel
        listing_data = await ListingModel.listing_helper(
            listing_doc, users_collection, ratings_collection
        )
        listings.append(listing_data)
    
    return listings