from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from typing import List, Optional
from datetime import datetime
import math

from app.database import get_reports_collection, get_users_collection, get_listings_collection
from app.models.report import ReportModel
from app.schemas.report import Report, ReportCreate, ReportResponse, ReportType, ReportStatus
from app.schemas.user import User
from app.schemas.response import SuccessResponse
from app.routers.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=SuccessResponse)
async def create_report(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new report"""
    reports_collection = await get_reports_collection()
    
    # Check if user already reported this target
    existing_report = await reports_collection.find_one({
        "reporterId": ObjectId(current_user.id),
        "targetId": ObjectId(report_data.target_id),
        "type": report_data.type
    })
    
    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reported this item"
        )
    
    # Create report
    report_dict = ReportModel.create_report_dict(
        current_user.id,
        report_data.type,
        report_data.target_id,
        report_data.description
    )
    
    result = await reports_collection.insert_one(report_dict)
    
    if result.inserted_id:
        # Update the reported item if it's a product
        if report_data.type == ReportType.PRODUCT:
            listings_collection = await get_listings_collection()
            await listings_collection.update_one(
                {"_id": ObjectId(report_data.target_id)},
                {"$set": {"isReported": True}}
            )
        
        return SuccessResponse(
            message="Report submitted successfully",
            data={"report_id": str(result.inserted_id)}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to create report"
    )

@router.get("/my-reports", response_model=ReportResponse)
async def get_my_reports(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user)
):
    """Get current user's reports"""
    reports_collection = await get_reports_collection()
    
    query = {"reporterId": ObjectId(current_user.id)}
    
    # Count total documents
    total = await reports_collection.count_documents(query)
    total_pages = math.ceil(total / per_page)
    
    # Get reports with pagination
    skip = (page - 1) * per_page
    cursor = reports_collection.find(query).sort("createdAt", -1).skip(skip).limit(per_page)
    
    reports = []
    async for report in cursor:
        reports.append(ReportModel.report_helper(report))
    
    return ReportResponse(
        reports=reports,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.get("/{report_id}", response_model=Report)
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific report (only if user owns it)"""
    if not ReportModel.validate_object_id(report_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid report ID"
        )
    
    reports_collection = await get_reports_collection()
    report = await reports_collection.find_one({
        "_id": ObjectId(report_id),
        "reporterId": ObjectId(current_user.id)
    })
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or access denied"
        )
    
    return ReportModel.report_helper(report)