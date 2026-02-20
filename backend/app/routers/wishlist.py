from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from typing import Optional
from datetime import datetime
import math

from app.database import get_database, get_listings_collection, get_users_collection, get_ratings_collection
from app.models.wishlist import WishlistModel
from app.models.listing import ListingModel
from app.routers.auth import get_current_user

router = APIRouter()


async def get_saved_listings_collection():
    """Get the saved_listings collection from the database."""
    database = await get_database()
    return database.saved_listings


@router.post("/{listing_id}")
async def toggle_wishlist(
    listing_id: str,
    current_user=Depends(get_current_user)
):
    """Toggle save/unsave a listing for the current user"""
    if not WishlistModel.validate_object_id(listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID"
        )

    listings_collection = await get_listings_collection()
    saved_listings_collection = await get_saved_listings_collection()

    # Check that the listing exists
    listing = await listings_collection.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )

    user_id = current_user.id

    # Check if already saved
    existing = await saved_listings_collection.find_one({
        "userId": ObjectId(user_id),
        "listingId": ObjectId(listing_id)
    })

    if existing:
        # Unsave
        await saved_listings_collection.delete_one({"_id": existing["_id"]})
        return {"saved": False, "message": "Listing removed from wishlist"}
    else:
        # Save with current price
        wishlist_doc = WishlistModel.create_wishlist_dict(
            user_id=user_id,
            listing_id=listing_id,
            saved_price=listing.get("price", 0.0)
        )
        await saved_listings_collection.insert_one(wishlist_doc)
        return {"saved": True, "message": "Listing added to wishlist"}


@router.get("/")
async def get_wishlist(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(12, ge=1, le=50, description="Items per page"),
    current_user=Depends(get_current_user)
):
    """Get all saved listings for the current user with full listing details"""
    saved_listings_collection = await get_saved_listings_collection()
    listings_collection = await get_listings_collection()
    users_collection = await get_users_collection()
    ratings_collection = await get_ratings_collection()

    user_id = current_user.id

    # Count total saved items
    query = {"userId": ObjectId(user_id)}
    total = await saved_listings_collection.count_documents(query)
    total_pages = math.ceil(total / per_page) if total > 0 else 1

    # Calculate skip
    skip = (page - 1) * per_page

    # Get saved listings sorted by most recent
    cursor = saved_listings_collection.find(query).sort("createdAt", -1).skip(skip).limit(per_page)

    items = []
    async for saved_item in cursor:
        wishlist_data = WishlistModel.wishlist_helper(saved_item)

        # Fetch the full listing details
        listing = None
        price_changed = False
        current_price = None

        try:
            listing_doc = await listings_collection.find_one({"_id": saved_item["listingId"]})
            if listing_doc:
                listing = await ListingModel.listing_helper(listing_doc, users_collection, ratings_collection)
                current_price = listing_doc.get("price", 0.0)
                saved_price = saved_item.get("savedPrice")

                if saved_price is not None and current_price is not None:
                    price_changed = current_price < saved_price

                # Add price_history to listing data if it exists
                price_history = listing_doc.get("price_history", [])
                listing["price_history"] = [
                    {
                        "price": entry.get("price"),
                        "changed_at": str(entry.get("changed_at", ""))
                    }
                    for entry in price_history
                ]
        except Exception:
            pass

        items.append({
            "id": wishlist_data["id"],
            "listing_id": wishlist_data["listing_id"],
            "user_id": wishlist_data["user_id"],
            "saved_price": wishlist_data["saved_price"],
            "saved_at": wishlist_data["saved_at"],
            "listing": listing,
            "price_changed": price_changed,
            "current_price": current_price,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    }


@router.get("/count")
async def get_wishlist_count(
    current_user=Depends(get_current_user)
):
    """Get the count of saved listings for the current user"""
    saved_listings_collection = await get_saved_listings_collection()
    user_id = current_user.id

    count = await saved_listings_collection.count_documents({"userId": ObjectId(user_id)})
    return {"count": count}


@router.get("/price-drops")
async def get_price_drops(
    current_user=Depends(get_current_user)
):
    """Get saved listings where the current price is lower than the saved price"""
    saved_listings_collection = await get_saved_listings_collection()
    listings_collection = await get_listings_collection()
    users_collection = await get_users_collection()
    ratings_collection = await get_ratings_collection()

    user_id = current_user.id

    # Get all saved items for this user
    cursor = saved_listings_collection.find({"userId": ObjectId(user_id)}).sort("createdAt", -1)

    price_drop_items = []
    async for saved_item in cursor:
        try:
            listing_doc = await listings_collection.find_one({"_id": saved_item["listingId"]})
            if not listing_doc:
                continue

            current_price = listing_doc.get("price", 0.0)
            saved_price = saved_item.get("savedPrice")

            if saved_price is not None and current_price < saved_price:
                listing = await ListingModel.listing_helper(listing_doc, users_collection, ratings_collection)

                # Add price_history to listing data if it exists
                price_history = listing_doc.get("price_history", [])
                listing["price_history"] = [
                    {
                        "price": entry.get("price"),
                        "changed_at": str(entry.get("changed_at", ""))
                    }
                    for entry in price_history
                ]

                price_difference = saved_price - current_price
                percentage_drop = (price_difference / saved_price) * 100 if saved_price > 0 else 0

                price_drop_items.append({
                    "id": str(saved_item["_id"]),
                    "listing_id": str(saved_item["listingId"]),
                    "user_id": str(saved_item["userId"]),
                    "saved_price": saved_price,
                    "current_price": current_price,
                    "price_difference": round(price_difference, 2),
                    "percentage_drop": round(percentage_drop, 2),
                    "saved_at": str(saved_item.get("createdAt", "")),
                    "listing": listing,
                })
        except Exception:
            continue

    return price_drop_items


@router.get("/check/{listing_id}")
async def check_wishlist(
    listing_id: str,
    current_user=Depends(get_current_user)
):
    """Check if a listing is saved by the current user"""
    if not WishlistModel.validate_object_id(listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID"
        )

    saved_listings_collection = await get_saved_listings_collection()
    user_id = current_user.id

    existing = await saved_listings_collection.find_one({
        "userId": ObjectId(user_id),
        "listingId": ObjectId(listing_id)
    })

    return {"saved": existing is not None}


@router.get("/save-count/{listing_id}")
async def get_save_count(
    listing_id: str,
):
    """Get how many users have saved a specific listing (social proof). No auth required."""
    if not WishlistModel.validate_object_id(listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID"
        )

    saved_listings_collection = await get_saved_listings_collection()

    count = await saved_listings_collection.count_documents({"listingId": ObjectId(listing_id)})
    return {"listing_id": listing_id, "save_count": count}