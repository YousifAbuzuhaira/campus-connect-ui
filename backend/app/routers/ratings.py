from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from typing import List, Optional

from app.database import get_ratings_collection, get_listings_collection, get_users_collection
from app.models.rating import RatingModel
from app.schemas.rating import Rating, RatingCreate, RatingUpdate, RatingResponse
from app.schemas.user import User
from app.schemas.response import SuccessResponse
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/{listing_id}", response_model=RatingResponse)
async def get_listing_ratings(
    listing_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=50, description="Items per page")
):
    """Get ratings for a specific listing"""
    if not RatingModel.validate_object_id(listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID format"
        )
    
    ratings_collection = await get_ratings_collection()
    listings_collection = await get_listings_collection()
    
    # Verify listing exists
    listing = await listings_collection.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Get ratings with pagination
    skip = (page - 1) * per_page
    query = {"listingId": ObjectId(listing_id)}
    
    ratings_cursor = ratings_collection.find(query).sort("createdAt", -1).skip(skip).limit(per_page)
    ratings = await ratings_cursor.to_list(per_page)
    
    total = await ratings_collection.count_documents(query)
    
    # Calculate average rating
    average_rating, total_ratings = await RatingModel.calculate_listing_average_rating(
        ratings_collection, listing_id
    )
    
    # Convert ratings to response format
    rating_list = []
    for rating in ratings:
        rating_dict = await RatingModel.rating_helper(rating)
        rating_list.append(Rating(**rating_dict))
    
    return RatingResponse(
        ratings=rating_list,
        total=total,
        average_rating=average_rating,
        total_ratings=total_ratings
    )

@router.post("/{listing_id}", response_model=SuccessResponse)
async def create_rating(
    listing_id: str,
    rating_data: RatingCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new rating for a listing"""
    if not RatingModel.validate_object_id(listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID format"
        )
    
    ratings_collection = await get_ratings_collection()
    listings_collection = await get_listings_collection()
    
    # Verify listing exists and is not the user's own listing
    listing = await listings_collection.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if str(listing["sellerId"]) == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot rate your own listing"
        )
    
    # Check if user has already rated this listing
    existing_rating = await ratings_collection.find_one({
        "listingId": ObjectId(listing_id),
        "userId": ObjectId(current_user.id)
    })
    
    if existing_rating:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already rated this listing"
        )
    
    # Create rating
    rating_dict = RatingModel.create_rating_dict(
        rating_data.dict(),
        current_user.id,
        listing_id,
        current_user.full_name
    )
    
    result = await ratings_collection.insert_one(rating_dict)
    
    if result.inserted_id:
        return SuccessResponse(message="Rating created successfully")
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to create rating"
    )

@router.put("/{listing_id}/{rating_id}", response_model=SuccessResponse)
async def update_rating(
    listing_id: str,
    rating_id: str,
    rating_data: RatingUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update an existing rating"""
    if not RatingModel.validate_object_id(listing_id) or not RatingModel.validate_object_id(rating_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    
    ratings_collection = await get_ratings_collection()
    
    # Find the rating and verify ownership
    rating = await ratings_collection.find_one({
        "_id": ObjectId(rating_id),
        "listingId": ObjectId(listing_id),
        "userId": ObjectId(current_user.id)
    })
    
    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rating not found or you don't have permission to update it"
        )
    
    # Update rating
    update_data = RatingModel.update_rating_dict(rating_data.dict(exclude_unset=True))
    
    result = await ratings_collection.update_one(
        {"_id": ObjectId(rating_id)},
        {"$set": update_data}
    )
    
    if result.modified_count:
        return SuccessResponse(message="Rating updated successfully")
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to update rating"
    )

@router.delete("/{listing_id}/{rating_id}", response_model=SuccessResponse)
async def delete_rating(
    listing_id: str,
    rating_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a rating"""
    if not RatingModel.validate_object_id(listing_id) or not RatingModel.validate_object_id(rating_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    
    ratings_collection = await get_ratings_collection()
    
    # Find the rating and verify ownership
    rating = await ratings_collection.find_one({
        "_id": ObjectId(rating_id),
        "listingId": ObjectId(listing_id),
        "userId": ObjectId(current_user.id)
    })
    
    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rating not found or you don't have permission to delete it"
        )
    
    # Delete rating
    result = await ratings_collection.delete_one({"_id": ObjectId(rating_id)})
    
    if result.deleted_count:
        return SuccessResponse(message="Rating deleted successfully")
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to delete rating"
    )