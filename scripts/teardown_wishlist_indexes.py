#!/usr/bin/env python3
"""
MongoDB Teardown Script for Campus Connect - Wishlist/Saved Listings
Drops the saved_listings collection and its indexes for rollback.
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


async def teardown_indexes():
    """Drop the saved_listings collection and all its indexes."""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "campus_connect")

    client = None
    try:
        client = AsyncIOMotorClient(mongodb_url)
        db = client[database_name]

        # Test connection
        await client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB at {mongodb_url}")

        collection_name = "saved_listings"

        # Check if collection exists
        existing_collections = await db.list_collection_names()
        if collection_name not in existing_collections:
            logger.info(f"Collection '{collection_name}' does not exist. Nothing to tear down.")
            return

        # List indexes before dropping for reference
        collection = db[collection_name]
        indexes = await collection.index_information()
        logger.info(f"Existing indexes on '{collection_name}':")
        for index_name, index_info in indexes.items():
            logger.info(f"  {index_name}: {index_info}")

        # Count documents for reference
        doc_count = await collection.count_documents({})
        logger.info(f"Collection '{collection_name}' contains {doc_count} documents")

        # Drop the entire collection (this also drops all indexes)
        await collection.drop()
        logger.info(f"Successfully dropped collection '{collection_name}' and all its indexes")

        logger.info("Wishlist teardown completed successfully.")

    except Exception as e:
        logger.error(f"Failed to tear down wishlist collection: {e}")
        sys.exit(1)
    finally:
        if client:
            client.close()
            logger.info("Disconnected from MongoDB")


if __name__ == "__main__":
    asyncio.run(teardown_indexes())