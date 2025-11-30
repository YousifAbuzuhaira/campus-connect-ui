from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ReportType(str, Enum):
    PRODUCT = "product"
    USER = "user"
    MESSAGE = "message"

class ReportStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class ReportBase(BaseModel):
    type: ReportType
    target_id: str
    description: str

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: str
    reporter_id: str
    status: ReportStatus = ReportStatus.PENDING
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    reporter_name: Optional[str] = None
    target_name: Optional[str] = None

    class Config:
        from_attributes = True

class ReportResponse(BaseModel):
    reports: List[Report]
    total: int
    page: int
    per_page: int
    total_pages: int