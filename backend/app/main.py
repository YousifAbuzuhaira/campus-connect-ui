from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.database import connect_to_mongo, close_mongo_connection
from app.routers import auth, listings, users, chat, reports, home, ratings, admin

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Campus Connect API",
    description="Backend API for Campus Connect application",
    version="1.0.0",
)

# CORS Configuration - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Health check
@app.get("/")
async def root():
    return {"message": "Campus Connect API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(listings.router, prefix="/api/listings", tags=["listings"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(home.router, prefix="/api/home", tags=["home"])
app.include_router(ratings.router, prefix="/api/ratings", tags=["ratings"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "False").lower() == "true"
    )