from pydantic import BaseModel
from typing import Optional, Dict, Any

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    username: str
    full_name: str
    university: str = None
    phone: str = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: Dict[str, Any]

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str