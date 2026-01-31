from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: str
    username: str
    full_name: str
    university_id: Optional[str] = None
    university: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    gender: Optional[str] = None
    balance: Optional[float] = None # Removed default balance

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    university_id: Optional[str] = None
    university: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    gender: Optional[str] = None

class UserInDB(UserBase):
    id: str
    hashed_password: str
    is_active: bool = True
    is_banned: bool = False
    is_admin: bool = False
    blocked_ids: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class User(UserBase):
    id: str
    is_active: bool
    is_banned: bool = False
    is_admin: bool = False
    blocked_ids: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None

class AddFundsRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to add (must be positive)")