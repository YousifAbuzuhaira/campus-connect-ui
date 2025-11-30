from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from datetime import datetime, timedelta
from bson import ObjectId
import os

from app.database import get_users_collection
from app.models.user import UserModel
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import User, UserCreate
from app.schemas.response import SuccessResponse, ErrorResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def initialize_admin_account():
    """Initialize the default admin account if it doesn't exist"""
    users_collection = await get_users_collection()
    
    # Check if admin already exists
    admin_exists = await users_collection.find_one({"email": "admin@aubh.edu"})
    if not admin_exists:
        # Create admin account
        admin_data = {
            "email": "admin@aubh.edu",
            "username": "admin",
            "full_name": "System Administrator",
            "university": "AUBH",
            "phone": "",
            "bio": "System Administrator Account",
            "gender": "other",
            "is_admin": True
        }
        
        hashed_password = UserModel.get_password_hash("admin")
        admin_dict = UserModel.create_user_dict(admin_data, hashed_password)
        
        await users_collection.insert_one(admin_dict)
        print("Admin account created successfully")

# Handle CORS preflight requests
@router.options("/register")
async def register_options():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@router.options("/login")
async def login_options():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    users_collection = await get_users_collection()
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    # Check if user is banned
    if user.get("isBanned", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been banned. Please contact support.",
        )
    
    user_dict = UserModel.user_helper(user)
    return User(**user_dict)

@router.post("/register", response_model=SuccessResponse)
async def register(user_data: RegisterRequest):
    print(f"Received registration data: {user_data}")
    print(f"Data dict: {user_data.dict()}")
    
    users_collection = await get_users_collection()
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    existing_username = await users_collection.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Hash password and create user
    hashed_password = UserModel.get_password_hash(user_data.password)
    user_dict = UserModel.create_user_dict(user_data.dict(), hashed_password)
    
    result = await users_collection.insert_one(user_dict)
    
    if result.inserted_id:
        return SuccessResponse(
            message="User registered successfully",
            data={"user_id": str(result.inserted_id)}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to create user"
    )

@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: LoginRequest):
    # Initialize admin account if it doesn't exist
    await initialize_admin_account()
    
    users_collection = await get_users_collection()
    
    # Find user by email
    user = await users_collection.find_one({"email": user_credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not UserModel.verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is banned
    if user.get("isBanned", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been banned. Please contact support.",
        )
    
    # Create access token with admin status
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "is_admin": user.get("isAdmin", False)}, 
        expires_delta=access_token_expires
    )
    
    # Prepare user data (remove sensitive fields)
    user_data = UserModel.user_helper(user)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_data
    )

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout():
    # For JWT tokens, logout is handled client-side by removing the token
    return {"message": "Successfully logged out"}