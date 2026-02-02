from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from typing import List, Optional
from datetime import datetime
import math
from enum import Enum # New import for Enums

from app.database import get_listings_collection, get_users_collection, get_ratings_collection
from app.models.listing import ListingModel
from app.schemas.listing import Listing, ListingCreate, ListingUpdate, ListingResponse, ListingCategory, ListingStatus, PurchaseRequest, PurchaseResponse
from app.schemas.user import User
from app.schemas.response import SuccessResponse
from app.routers.auth import get_current_user

router = APIRouter()

# Define Enums for advanced sorting options
class ListingSortField(str, Enum):
    """
    Defines the available fields for sorting listings.
    'relevance' is only applicable when a search query is provided.
    """
    CREATED_AT = "created_at"
    PRICE = "price"
    TITLE = "title"
    VIEWS = "views"
    RELEVANCE = "relevance"

class SortOrder(str, Enum):
    """
    Defines the available sort orders.
    """
    ASC = "asc"
    DESC = "desc"

@router.get("/", response_model=ListingResponse)
async def get_listings(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=50, description="Items per page"),
    category: Optional[ListingCategory] = Query(None, description="Filter by category"),
    status: Optional[ListingStatus] = Query(ListingStatus.ACTIVE, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    # Updated sort_by and sort_order to use Enums for better validation and clarity
    sort_by: ListingSortField = Query(ListingSortField.CREATED_AT, description="Sort field"),
    sort_order: SortOrder = Query(SortOrder.DESC, description="Sort order (asc/desc)")
):
    """
    Get listings with comprehensive filtering, searching, and pagination.
    Allows filtering by category, status, price range, and searching by text.
    Supports sorting by various fields including relevance (when a search term is present).
    """
    listings_collection = await get_listings_collection()
    users_collection = await get_users_collection()
    
    # Build query
    query = {"isHidden": False}  # Always exclude hidden products from general browsing
    
    # Filter by listing status
    if status and status == ListingStatus.ACTIVE:
        query["isSold"] = False
    elif status and status == ListingStatus.SOLD:
        query["isSold"] = True
    
    # Filter by category
    if category:
        query["category"] = category.value # Use .value for enum to get the string representation
    
    # Filter by price range
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query
    
    # Handle search query using MongoDB's $text operator for full-text search.
    # This requires a text index on the 'title' and 'description' fields in MongoDB
    # for efficient and relevant search results. The existing regex search is replaced
    # by $text for better relevance scoring and performance.
    if search:
        query["$text"] = {"$search": search}
        # If a search term is provided, and sort_by is not explicitly set to relevance,
        # it's still a valid search. The text search will apply, but sorting will be
        # by the specified field unless 'relevance' is chosen.
    
    # Count total documents matching the query before pagination
    total = await listings_collection.count_documents(query)
    total_pages = math.ceil(total / per_page)
    
    # Calculate the number of documents to skip for pagination
    skip = (page - 1) * per_page
    
    # Build sort query
    sort_direction = 1 if sort_order == SortOrder.ASC else -1
    sort_query = []
    projection = {} # Used to include textScore in results if sorting by relevance

    # Handle sorting by relevance or other fields
    if sort_by == ListingSortField.RELEVANCE:
        if not search:
            # If relevance sort is requested without a search term,
            # default to sorting by creation date to avoid errors or unexpected behavior.
            # This makes the API more robust for unexpected client requests.
            sort_query.append((ListingSortField.CREATED_AT.value, -1)) # Default to latest
        else:
            # For relevance sorting, MongoDB requires projecting the textScore
            # and then sorting by it.
            projection["score"] = {"$meta": "textScore"}
            sort_query.append(("score", {"$meta": "textScore"}))
    else:
        # Standard sorting by a specified field
        sort_query.append((sort_by.value, sort_direction))
    
    # Get listings from the database
    ratings_collection = await get_ratings_collection()
    
    # Pass the query, projection (if any), sort criteria, skip, and limit to MongoDB
    cursor = listings_collection.find(query, projection).sort(sort_query).skip(skip).limit(per_page)
    
    listings = []
    async for listing in cursor:
        # If 'score' was added to the document by MongoDB for relevance sorting,
        # remove it before passing to the helper function or Pydantic model
        # to ensure it matches the expected Listing schema.
        if "score" in listing:
            del listing["score"]
        listings.append(await ListingModel.listing_helper(listing, users_collection, ratings_collection))
    
    return ListingResponse(
        listings=listings,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.post("/{listing_id}/purchase", response_model=SuccessResponse)
async def purchase_listing(
    listing_id: str,
    purchase_request: PurchaseRequest,
    current_user: User = Depends(get_current_user)
):
    """Purchase a listing"""
    # Prevent admins from purchasing items
    if current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot purchase items"
        )
    
    if not ListingModel.validate_object_id(listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID"
        )
    
    listings_collection = await get_listings_collection()
    users_collection = await get_users_collection()
    
    # Get the listing
    listing = await listings_collection.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Check if listing is available
    if listing.get("isSold", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This item is already sold"
        )
    
    if listing.get("isHidden", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This listing is not available"
        )
    
    # Check if user is trying to buy their own listing
    if str(listing["sellerId"]) == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot purchase your own listing"
        )
    
    # Check stock availability
    current_stock = listing.get("stock", 0)
    if current_stock < purchase_request.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough stock available. Only {current_stock} items left"
        )
    
    # Calculate total cost
    total_cost = listing["price"] * purchase_request.quantity
    
    # Get buyer's current balance
    buyer = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    if not buyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Buyer not found"
        )
    
    buyer_balance = buyer.get("balance", 0.0)
    if buyer_balance < total_cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient funds. You have ${buyer_balance:.2f}, but need ${total_cost:.2f}"
        )
    
    # Get seller's current balance
    seller = await users_collection.find_one({"_id": listing["sellerId"]})
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )
    
    seller_balance = seller.get("balance", 0.0)
    
    # Start transaction simulation (MongoDB transactions would be ideal here)
    try:
        # Update buyer balance (deduct money)
        buyer_new_balance = buyer_balance - total_cost
        buyer_update_result = await users_collection.update_one(
            {"_id": ObjectId(current_user.id)},
            {
                "$set": {
                    "balance": buyer_new_balance,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if buyer_update_result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update buyer balance"
            )
        
        # Update seller balance (add money)
        seller_new_balance = seller_balance + total_cost
        seller_update_result = await users_collection.update_one(
            {"_id": listing["sellerId"]},
            {
                "$set": {
                    "balance": seller_new_balance,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if seller_update_result.modified_count == 0:
            # Rollback buyer balance if seller update fails
            await users_collection.update_one(
                {"_id": ObjectId(current_user.id)},
                {
                    "$set": {
                        "balance": buyer_balance,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update seller balance"
            )
        
        # Update listing stock
        remaining_stock = current_stock - purchase_request.quantity
        listing_update_data = {
            "stock": remaining_stock,
            "updatedAt": datetime.utcnow()
        }
        
        # If no stock remaining, mark as sold
        if remaining_stock == 0:
            listing_update_data["isSold"] = True
        
        # Add buyer to buyers list
        current_buyers = listing.get("buyerIds", [])
        if ObjectId(current_user.id) not in current_buyers:
            current_buyers.append(ObjectId(current_user.id))
            listing_update_data["buyerIds"] = current_buyers
        
        listing_update_result = await listings_collection.update_one(
            {"_id": ObjectId(listing_id)},
            {"$set": listing_update_data}
        )
        
        if listing_update_result.modified_count == 0:
            # Rollback both user balances if listing update fails
            await users_collection.update_one(
                {"_id": ObjectId(current_user.id)},
                {"$set": {"balance": buyer_balance, "updatedAt": datetime.utcnow()}}
            )
            await users_collection.update_one(
                {"_id": listing["sellerId"]},
                {"$set": {"balance": seller_balance, "updatedAt": datetime.utcnow()}}
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update listing"
            )
        
        # Generate a simple transaction ID
        transaction_id = f"tx_{listing_id}_{current_user.id}_{int(datetime.utcnow().timestamp())}"
        
        return SuccessResponse(
            message="Purchase completed successfully!",
            data={
                "listing_id": listing_id,
                "quantity_purchased": purchase_request.quantity,
                "total_cost": total_cost,
                "remaining_stock": remaining_stock,
                "buyer_new_balance": buyer_new_balance,
                "seller_new_balance": seller_new_balance,
                "transaction_id": transaction_id,
                "listing_title": listing.get("title", ""),
                "seller_name": seller.get("fullName", seller.get("userName", "Unknown"))
            }
        )
        
    except Exception as e:
        # If any error occurs, ensure we don't leave the system in an inconsistent state
        # In a production system, this would be handled by proper database transactions
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Purchase failed: {str(e)}"
        )

@router.get("/{listing_id}", response_model=Listing)
async def get_listing(listing_id: str):
    """Get a specific listing by ID"""
    if not ListingModel.validate_object_id(listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID"
        )
    
    listings_collection = await get_listings_collection()
    users_collection = await get_users_collection()
    ratings_collection = await get_ratings_collection()
    listing = await listings_collection.find_one({"_id": ObjectId(listing_id)})
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Increment view count
    await listings_collection.update_one(
        {"_id": ObjectId(listing_id)},
        {"$inc": {"views": 1}}
    )
    listing["views"] = listing.get("views", 0) + 1
    
    return await ListingModel.listing_helper(listing, users_collection, ratings_collection)

@router.post("/", response_model=SuccessResponse)
async def create_listing(
    listing_data: ListingCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new listing"""
    # Prevent admins from creating listings
    if current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot create listings"
        )
    
    listings_collection = await get_listings_collection()
    
    listing_dict = ListingModel.create_listing_dict(
        listing_data.dict(),
        current_user.id,
        current_user.email,
        current_user.full_name
    )
    
    result = await listings_collection.insert_one(listing_dict)
    
    if result.inserted_id:
        return SuccessResponse(
            message="Listing created successfully",
            data={"listing_id": str(result.inserted_id)}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to create listing"
    )

@router.put("/{listing_id}", response_model=SuccessResponse)
async def update_listing(
    listing_id: str,
    listing_data: ListingUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a listing"""
    if not ListingModel.validate_object_id(listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID"
        )
    
    listings_collection = await get_listings_collection()
    
    # Check if listing exists and belongs to current user
    listing = await listings_collection.find_one({
        "_id": ObjectId(listing_id),
        "sellerId": ObjectId(current_user.id)
    })
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found or you don't have permission to edit it"
        )
    
    # Prepare update data
    update_data = ListingModel.update_listing_dict(listing_data.dict(exclude_unset=True))
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    # Update listing
    result = await listings_collection.update_one(
        {"_id": ObjectId(listing_id)},
        {"$set": update_data}
    )
    
    if result.modified_count:
        return SuccessResponse(
            message="Listing updated successfully",
            data={"updated_fields": list(update_data.keys())}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to update listing"
    )

@router.delete("/{listing_id}", response_model=SuccessResponse)
async def delete_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a listing"""
    if not ListingModel.validate_object_id(listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID"
        )
    
    listings_collection = await get_listings_collection()
    
    # Check if listing exists and belongs to current user
    result = await listings_collection.delete_one({
        "_id": ObjectId(listing_id),
        "sellerId": ObjectId(current_user.id)
    })
    
    if result.deleted_count:
        return SuccessResponse(
            message="Listing deleted successfully"
        )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Listing not found or you don't have permission to delete it"
    )

@router.get("/user/my-listings", response_model=ListingResponse)
async def get_my_listings(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user)
):
    """Get current user's listings"""
    listings_collection = await get_listings_collection()
    users_collection = await get_users_collection()
    
    query = {"sellerId": ObjectId(current_user.id)}
    
    # Count total documents
    total = await listings_collection.count_documents(query)
    total_pages = math.ceil(total / per_page)
    
    # Calculate skip
    skip = (page - 1) * per_page
    
    # Get listings
    ratings_collection = await get_ratings_collection()
    cursor = listings_collection.find(query).sort("created_at", -1).skip(skip).limit(per_page)
    listings = []
    async for listing in cursor:
        listings.append(await ListingModel.listing_helper(listing, users_collection, ratings_collection))
    
    return ListingResponse(
        listings=listings,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )