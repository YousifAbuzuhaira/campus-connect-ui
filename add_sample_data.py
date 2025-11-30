import asyncio
import os
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection (make sure MongoDB is running)
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "campusConnect"

async def add_sample_data():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # Sample listings
    sample_listings = [
        {
            "sellerId": ObjectId(),
            "title": "Introduction to Computer Science Textbook",
            "description": "Excellent condition textbook for CS101. All chapters covered, minimal highlighting.",
            "price": 75.00,
            "category": "Textbooks",
            "condition": "Excellent",
            "pickupLocation": "Engineering Building",
            "stock": 1,
            "buyerIds": [],
            "isSold": False,
            "isReported": False,
            "isHidden": False,
            "images": ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400"],
            "tags": ["CS101", "textbook"],
            "views": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        },
        {
            "sellerId": ObjectId(),
            "title": "MacBook Pro 13-inch (2020)",
            "description": "Used MacBook Pro in great condition. Perfect for students. Includes charger.",
            "price": 899.00,
            "category": "Electronics",
            "condition": "Good",
            "pickupLocation": "Student Center",
            "stock": 1,
            "buyerIds": [],
            "isSold": False,
            "isReported": False,
            "isHidden": False,
            "images": ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400"],
            "tags": ["laptop", "apple"],
            "views": 5,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        },
        {
            "sellerId": ObjectId(),
            "title": "Study Desk with Chair",
            "description": "Wooden study desk with matching chair. Great for dorm rooms.",
            "price": 120.00,
            "category": "Furniture",
            "condition": "Good",
            "pickupLocation": "Dormitory Lobby",
            "stock": 1,
            "buyerIds": [],
            "isSold": False,
            "isReported": False,
            "isHidden": False,
            "images": ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"],
            "tags": ["furniture", "study"],
            "views": 3,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        },
        {
            "sellerId": ObjectId(),
            "title": "Scientific Calculator",
            "description": "TI-84 Plus graphing calculator. Essential for math and science courses.",
            "price": 45.00,
            "category": "Electronics",
            "condition": "Good",
            "pickupLocation": "Library",
            "stock": 1,
            "buyerIds": [],
            "isSold": False,
            "isReported": False,
            "isHidden": False,
            "images": ["https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"],
            "tags": ["calculator", "TI-84"],
            "views": 2,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        },
        {
            "sellerId": ObjectId(),
            "title": "Mountain Bike",
            "description": "Great condition mountain bike perfect for campus transportation. Recently tuned.",
            "price": 200.00,
            "category": "Transportation",
            "condition": "Excellent",
            "pickupLocation": "Campus Parking Lot B",
            "stock": 1,
            "buyerIds": [],
            "isSold": False,
            "isReported": False,
            "isHidden": False,
            "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
            "tags": ["bike", "transportation"],
            "views": 8,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        },
    ]
    
    # Insert sample data
    result = await db.products.insert_many(sample_listings)
    print(f"Successfully added {len(result.inserted_ids)} sample listings!")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(add_sample_data())