#!/usr/bin/env python3
"""
Script to update category names in the database to use proper capitalization.
This ensures consistency between frontend, backend, and database.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import UpdateOne
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "campus_connect")

# Category mapping from old to new values
CATEGORY_MAPPING = {
    "electronics": "Electronics",
    "furniture": "Furniture", 
    "books": "Books",
    "textbooks": "Books",               # Map textbooks to Books
    "Textbooks": "Books",               # Map Textbooks to Books
    "clothing": "Clothing",
    "sports": "Sports",
    "transportation": "Transportation",
    "Transportation": "Transportation",  # Keep as is if already correct
    "Electronics": "Electronics",       # Keep as is if already correct
    "Furniture": "Furniture",           # Keep as is if already correct
    "other": "Other",
    "Other": "Other"                    # Keep as is if already correct
}

async def update_categories():
    """Update category values in the products collection"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    products_collection = db.products
    
    try:
        print("Starting category update...")
        
        # Get all products
        products = await products_collection.find({}).to_list(None)
        print(f"Found {len(products)} products to check")
        
        # Prepare bulk operations
        bulk_operations = []
        updated_count = 0
        
        for product in products:
            current_category = product.get("category", "")
            
            # Check if category needs updating
            if current_category in CATEGORY_MAPPING:
                new_category = CATEGORY_MAPPING[current_category]
                
                # Only update if the category is actually different
                if current_category != new_category:
                    bulk_operations.append(
                        UpdateOne(
                            {"_id": product["_id"]},
                            {"$set": {"category": new_category}}
                        )
                    )
                    print(f"Will update product '{product.get('title', 'Unknown')}': '{current_category}' → '{new_category}'")
                    updated_count += 1
                else:
                    print(f"Product '{product.get('title', 'Unknown')}' already has correct category: '{current_category}'")
            else:
                print(f"Unknown category '{current_category}' for product '{product.get('title', 'Unknown')}' - please check manually")
        
        # Execute bulk operations if any
        if bulk_operations:
            result = await products_collection.bulk_write(bulk_operations)
            print(f"\nBulk update completed:")
            print(f"- Matched: {result.matched_count}")
            print(f"- Modified: {result.modified_count}")
        else:
            print("\nNo updates needed - all categories are already correct!")
        
        print(f"\nSummary: {updated_count} products needed category updates")
        
    except Exception as e:
        print(f"Error updating categories: {e}")
        raise
    finally:
        # Close the connection
        client.close()
        print("Database connection closed")

async def verify_categories():
    """Verify the categories after update"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    products_collection = db.products
    
    try:
        print("\nVerifying categories after update...")
        
        # Get all unique categories
        pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        
        categories = await products_collection.aggregate(pipeline).to_list(None)
        
        print("Current categories in database:")
        for cat in categories:
            print(f"  - '{cat['_id']}': {cat['count']} products")
            
    except Exception as e:
        print(f"Error verifying categories: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print("Category Update Script")
    print("=" * 50)
    
    # Run the update
    asyncio.run(update_categories())
    
    # Verify the results
    asyncio.run(verify_categories())
    
    print("\nUpdate completed! Please restart your backend server to pick up the changes.")