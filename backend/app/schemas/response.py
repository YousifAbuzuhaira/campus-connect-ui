from pydantic import BaseModel
from typing import Optional, Any

class BaseResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    details: Optional[str] = None

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None

class PaginatedResponse(BaseModel):
    success: bool = True
    data: Any
    pagination: dict
    total: int