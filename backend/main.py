import os
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# --- Configuration ---
# In a production environment, these values should be loaded from environment variables
# or a secure configuration management system.
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-that-should-be-changed-in-production-and-be-long-and-random")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Password Hashing Context ---
# CryptContext is used for securely hashing and verifying passwords.
# bcrypt is a strong, widely recommended hashing algorithm.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- OAuth2 Password Bearer Scheme ---
# This defines how FastAPI expects to receive the token (in the Authorization header as "Bearer <token>").
# The `tokenUrl` specifies the endpoint where clients can obtain a token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Pydantic Models ---
# These models define the structure of data for requests and responses,
# ensuring data validation and clear API contracts.

class User(BaseModel):
    """
    Represents a user's public profile information, typically returned by the API.
    Does not include sensitive data like hashed passwords.
    """
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    roles: List[str] = ["user"]  # Default role for new users

class UserInDB(User):
    """
    Represents a user's data as stored in the database, including the hashed password.
    Inherits from `User` and adds the `hashed_password` field.
    """
    hashed_password: str

class UserCreate(BaseModel):
    """
    Model for user registration input.
    Requires a username and password, with optional email, full name, and roles.
    """
    username: str
    password: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    roles: Optional[List[str]] = ["user"] # Allows specifying roles during creation, defaults to 'user'

class Token(BaseModel):
    """
    Model for the JWT token response after successful login.
    """
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """
    Model for the data contained within the JWT payload.
    'sub' (subject) typically holds the username, and 'roles' for authorization.
    """
    username: Optional[str] = None
    roles: Optional[List[str]] = None

# --- In-memory "Database" ---
# For a production application, this would be replaced by a persistent database
# (e.g., PostgreSQL with SQLAlchemy, MongoDB, etc.).
# This dictionary simulates user storage for demonstration purposes.
# Pre-populating with an admin and a regular user for testing convenience.
fake_users_db = {
    "adminuser": UserInDB(
        username="adminuser",
        email="admin@example.com",
        full_name="Admin User",
        hashed_password=pwd_context.hash("adminpassword"), # Hashing the password for storage
        disabled=False,
        roles=["admin", "user"],
    ),
    "testuser": UserInDB(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        hashed_password=pwd_context.hash("testpassword"), # Hashing the password for storage
        disabled=False,
        roles=["user"],
    ),
}

# --- Security Utility Functions ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a hashed password.
    Returns True if they match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hashes a plain-text password using the configured CryptContext.
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a JSON Web Token (JWT) for authentication.
    The token includes an expiration time and the provided data (e.g., username, roles).
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire}) # Add expiration timestamp to the payload
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- User Retrieval and Authentication Dependency Functions ---

def get_user(username: str) -> Optional[UserInDB]:
    """
    Retrieves a user from the fake database by username.
    In a real application, this would query a database.
    """
    if username in fake_users_db:
        return fake_users_db[username]
    return None

def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    """
    Authenticates a user by checking their username and password.
    Returns the UserInDB object if authentication is successful, None otherwise.
    """
    user = get_user(username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    FastAPI dependency function to decode the JWT token from the request header
    and retrieve the corresponding user.
    Raises HTTPException if the token is invalid, expired, or the user is not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT token using the secret key and algorithm
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub") # 'sub' (subject) is the standard claim for the principal
        roles: List[str] = payload.get("roles", []) # Extract roles from the token payload
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, roles=roles)
    except JWTError:
        # Catch any JWT-related errors (e.g., invalid signature, expired token)
        raise credentials_exception
    
    user = get_user(token_data.username)
    if user is None:
        raise credentials_exception
    
    # Return a `User` model, which excludes the sensitive `hashed_password`
    return User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        disabled=user.disabled,
        roles=user.roles,
    )

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    FastAPI dependency function that ensures the current user is active (not disabled).
    This builds upon `get_current_user`.
    """
    if current_user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

async def get_current_active_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """
    FastAPI dependency function that ensures the current user is active and has the 'admin' role.
    This provides role-based access control.
    """
    if "admin" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return current_user

# --- FastAPI Application Setup ---
app = FastAPI(
    title="User Authentication and Authorization API",
    description="A secure, token-based (JWT) user authentication and authorization system using FastAPI.",
    version="1.0.0",
)

# --- CORS Middleware ---
# Cross-Origin Resource Sharing (CORS) is essential for allowing web browsers
# to make requests from a different domain (your frontend) to your API.
# In a production environment, `allow_origins` should be restricted to your frontend's URL(s).
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers in the request
)

# --- API Endpoints ---

@app.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    **User Registration Endpoint**
    Registers a new user with the provided username, password, and optional details.
    - Checks if the username already exists.
    - Hashes the password before storing it.
    - Returns the newly created user's public profile.
    """
    if get_user(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered"
        )

    hashed_password = get_password_hash(user_data.password)
    db_user = UserInDB(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        disabled=False, # New users are active by default
        roles=user_data.roles,
    )
    fake_users_db[user_data.username] = db_user # Store the user in our fake DB
    
    # Return the User model, which does not expose the hashed_password
    return User(
        username=db_user.username,
        email=db_user.email,
        full_name=db_user.full_name,
        disabled=db_user.disabled,
        roles=db_user.roles,
    )

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    **User Login Endpoint**
    Authenticates a user using username and password (sent as form data).
    - If authentication is successful, a JWT access token is generated and returned.
    - The token includes the username ('sub') and roles, and has an expiration time.
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create the data payload for the JWT. 'sub' is the standard claim for the subject (user ID).
    # Including roles directly in the token allows for quick authorization checks without DB lookups.
    access_token_data = {"sub": user.username, "roles": user.roles}
    access_token = create_access_token(
        access_token_data, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    **Get Current User Endpoint**
    Retrieves the profile information of the currently authenticated and active user.
    - This endpoint is protected and requires a valid JWT access token.
    """
    return current_user

@app.get("/protected-admin", response_model=dict)
async def protected_admin_endpoint(current_user: User = Depends(get_current_active_admin_user)):
    """
    **Admin-Only Protected Endpoint**
    An example endpoint that demonstrates role-based access control.
    - Only users with the 'admin' role can access this endpoint.
    - Requires a valid JWT access token from an active admin user.
    """
    return {"message": f"Welcome, admin {current_user.username}! You have access to sensitive admin data."}

@app.get("/protected-user", response_model=dict)
async def protected_user_endpoint(current_user: User = Depends(get_current_active_user)):
    """
    **Authenticated User Protected Endpoint**
    An example endpoint that requires any authenticated and active user.
    - Accessible by any user who has successfully logged in and is not disabled.
    """
    return {"message": f"Hello, {current_user.username}! You are an authenticated user and can access general protected content."}

# To run this application:
# 1. Save the code as `main.py` in the `backend` directory.
# 2. Install necessary libraries: `pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt]`
# 3. Run from your terminal: `uvicorn backend.main:app --reload --port 8000`
# 4. Access the API documentation at `http://127.0.0.1:8000/docs`