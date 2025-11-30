import asyncio
import os
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "campusConnect"

# User IDs from your provided data
USERS = [
    {
        "_id": ObjectId("69286f42115f19bd2ada0449"),
        "email": "test@aubh.edu",
        "userName": "testing",
        "fullName": "Deez Nutss",
        "university": "test123",
        "phone": "39983391"
    },
    {
        "_id": ObjectId("6928712a4e32feaf7b256d8a"),
        "email": "Khalid@do.edu",
        "userName": "Khalido",
        "fullName": "Khalid Do",
        "university": "123abc"
    },
    {
        "_id": ObjectId("69299db56cbe036f1cf47d6f"),
        "email": "mazen@aubh.edu",
        "userName": "Egyptian",
        "fullName": "Mazen Egypt",
        "university": "A01119"
    }
]

async def connect_listings_to_sellers():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    try:
        # Get all listings that need seller assignment
        listings_collection = db.products  # Assuming listings are in products collection
        users_collection = db.users
        
        # Get all listings
        listings = await listings_collection.find({}).to_list(None)
        
        if not listings:
            print("No listings found in the database.")
            return
            
        print(f"Found {len(listings)} listings to update.")
        
        # Distribute listings among the users
        updated_count = 0
        for i, listing in enumerate(listings):
            # Select user in round-robin fashion
            user = USERS[i % len(USERS)]
            
            # Update the listing with the seller information
            update_data = {
                "sellerId": user["_id"],
                "seller_email": user["email"],
                "seller_name": user["fullName"],
                "updatedAt": datetime.utcnow()
            }
            
            # Update the listing
            result = await listings_collection.update_one(
                {"_id": listing["_id"]},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                updated_count += 1
                print(f"Updated listing '{listing['title']}' - assigned to {user['fullName']} ({user['email']})")
            
        print(f"\nSuccessfully updated {updated_count} listings!")
        
        # Display summary
        print("\nListing distribution summary:")
        for user in USERS:
            count = await listings_collection.count_documents({"sellerId": user["_id"]})
            print(f"- {user['fullName']} ({user['email']}): {count} listings")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Close connection
        client.close()

if __name__ == "__main__":
    asyncio.run(connect_listings_to_sellers())