from datetime import datetime
from bson import ObjectId
from typing import Optional, Dict, Any

class ReportModel:
    @staticmethod
    def report_helper(report: dict) -> dict:
        """Transform MongoDB document to API response format"""
        return {
            "id": str(report["_id"]),
            "reporter_id": str(report["reporterId"]),
            "type": report["type"],
            "target_id": str(report["targetId"]),
            "description": report["description"],
            "status": report.get("status", "pending"),
            "assigned_to": str(report["assignedTo"]) if report.get("assignedTo") else None,
            "resolution_notes": report.get("resolutionNotes"),
            "created_at": report.get("createdAt", datetime.utcnow()),
            "resolved_at": report.get("resolvedAt"),
        }
    
    @staticmethod
    def create_report_dict(reporter_id: str, report_type: str, target_id: str, description: str) -> dict:
        """Create report document for MongoDB insertion"""
        now = datetime.utcnow()
        return {
            "reporterId": ObjectId(reporter_id),
            "type": report_type,
            "targetId": ObjectId(target_id),
            "description": description,
            "status": "pending",
            "assignedTo": None,
            "resolutionNotes": None,
            "createdAt": now,
            "resolvedAt": None,
        }
    
    @staticmethod
    def validate_object_id(id_string: str) -> bool:
        """Validate if string is a valid ObjectId"""
        try:
            ObjectId(id_string)
            return True
        except:
            return False