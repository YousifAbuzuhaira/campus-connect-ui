import asyncio
import random
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "campusConnect"

async def add_random_quantities():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    try:
        # Get all listings
        listings_collection = db.products
        listings = await listings_collection.find({}).to_list(None)
        
        if not listings:
            print("No listings found in the database.")
            return
            
        print(f"Found {len(listings)} listings to update with random quantities.")
        
        updated_count = 0
        for listing in listings:
            # Generate random quantity between 10 and 20
            random_quantity = random.randint(10, 20)
            
            # Update the listing with random quantity
            result = await listings_collection.update_one(
                {"_id": listing["_id"]},
                {
                    "$set": {
                        "stock": random_quantity,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                updated_count += 1
                current_stock = listing.get("stock", 1)
                print(f"Updated '{listing['title']}': stock {current_stock} → {random_quantity}")
            
        print(f"\nSuccessfully updated {updated_count} listings with random quantities!")
        
        # Display final quantities
        print("\nFinal stock quantities:")
        updated_listings = await listings_collection.find({}).to_list(None)
        for listing in updated_listings:
            print(f"- {listing['title']}: {listing.get('stock', 'N/A')} items")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(add_random_quantities())