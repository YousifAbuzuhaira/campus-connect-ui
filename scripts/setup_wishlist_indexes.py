#!/usr/bin/env python3
"""
MongoDB Setup Script for Campus Connect - Wishlist/Saved Listings
Creates indexes on the saved_listings collection for performance and data integrity.
"""

import os
import sys
import asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging

# Add parent directory to path to import database module
sys.path.append(str(Path(__file__).parent.parent))

# Load environment variables
load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def setup_indexes():
    """Create indexes on the saved_listings collection."""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "campus_connect")

    client = None
    try:
        client = AsyncIOMotorClient(mongodb_url)
        db = client[database_name]

        # Test connection
        await client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB at {mongodb_url}")

        collection = db.saved_listings

        # Index 1: Compound unique index on userId + listingId
        # Prevents duplicate saves — a user can only save a listing once.
        # Field names match WishlistModel.create_wishlist_dict() which stores
        # "userId" and "listingId" (camelCase) in the documents.
        index_name = await collection.create_index(
            [("userId", 1), ("listingId", 1)],
            unique=True,
            name="idx_user_listing_unique"
        )
        logger.info(f"Created unique compound index: {index_name}")

        # Index 2: Recency index for fetching a user's saved listings sorted by most recent
        # Field name matches "createdAt" as stored by WishlistModel.create_wishlist_dict()
        index_name = await collection.create_index(
            [("userId", 1), ("createdAt", -1)],
            name="idx_user_recency"
        )
        logger.info(f"Created recency index: {index_name}")

        # Index 3: Listing popularity index for save count queries (social proof)
        # Used by GET /api/wishlist/save-count/{listing_id}
        index_name = await collection.create_index(
            [("listingId", 1)],
            name="idx_listing_popularity"
        )
        logger.info(f"Created listing popularity index: {index_name}")

        # List all indexes for verification
        indexes = await collection.index_information()
        logger.info(f"All indexes on 'saved_listings' collection:")
        for name, info in indexes.items():
            logger.info(f"  {name}: {info}")

        logger.info("Wishlist index setup completed successfully.")

    except Exception as e:
        logger.error(f"Failed to set up wishlist indexes: {e}")
        sys.exit(1)
    finally:
        if client:
            client.close()
            logger.info("Disconnected from MongoDB")


if __name__ == "__main__":
    asyncio.run(setup_indexes())