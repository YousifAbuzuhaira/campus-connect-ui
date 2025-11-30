from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def get_database():
    return db.database

async def connect_to_mongo():
    """Create database connection"""
    db.client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db.database = db.client[os.getenv("DATABASE_NAME")]
    print(f"Connected to MongoDB at {os.getenv('MONGODB_URL')}")

async def close_mongo_connection():
    """Close database connection"""
    db.client.close()
    print("Disconnected from MongoDB")

# Collections
async def get_users_collection():
    database = await get_database()
    return database.users

async def get_listings_collection():
    database = await get_database()
    return database.products  # Using 'products' collection as per schema

async def get_categories_collection():
    database = await get_database()
    return database.categories

async def get_chats_collection():
    database = await get_database()
    return database.chats

async def get_messages_collection():
    database = await get_database()
    return database.messages

async def get_reports_collection():
    database = await get_database()
    return database.reports

async def get_featured_products_collection():
    database = await get_database()
    return database.featuredProducts

async def get_ratings_collection():
    database = await get_database()
    return database.ratings