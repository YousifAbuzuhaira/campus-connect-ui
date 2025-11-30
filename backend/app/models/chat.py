from datetime import datetime
from bson import ObjectId
from typing import Optional, Dict, Any, List

class ChatModel:
    @staticmethod
    def chat_helper(chat: dict) -> dict:
        """Transform MongoDB document to API response format"""
        return {
            "id": str(chat["_id"]),
            "participant_a_id": str(chat["participantAId"]),
            "participant_b_id": str(chat["participantBId"]),
            "last_message": chat.get("lastMessage"),
            "last_message_at": chat.get("lastMessageAt"),
            "unread_count": chat.get("unreadCount", {"a": 0, "b": 0}),
            "created_at": chat.get("createdAt", datetime.utcnow()),
            "updated_at": chat.get("updatedAt", datetime.utcnow()),
        }
    
    @staticmethod
    def create_chat_dict(participant_a_id: str, participant_b_id: str) -> dict:
        """Create chat document for MongoDB insertion"""
        now = datetime.utcnow()
        return {
            "participantAId": ObjectId(participant_a_id),
            "participantBId": ObjectId(participant_b_id),
            "lastMessage": None,
            "lastMessageAt": None,
            "unreadCount": {"a": 0, "b": 0},
            "createdAt": now,
            "updatedAt": now,
        }
    
    @staticmethod
    def validate_object_id(id_string: str) -> bool:
        """Validate if string is a valid ObjectId"""
        try:
            ObjectId(id_string)
            return True
        except:
            return False

class MessageModel:
    @staticmethod
    def message_helper(message: dict) -> dict:
        """Transform MongoDB document to API response format"""
        return {
            "id": str(message["_id"]),
            "chat_id": str(message["chatId"]),
            "sender_id": str(message["senderId"]),
            "text": message["text"],
            "is_read": message.get("isRead", False),
            "created_at": message.get("createdAt", datetime.utcnow()),
            "read_at": message.get("readAt"),
        }
    
    @staticmethod
    def create_message_dict(chat_id: str, sender_id: str, text: str) -> dict:
        """Create message document for MongoDB insertion"""
        now = datetime.utcnow()
        return {
            "chatId": ObjectId(chat_id),
            "senderId": ObjectId(sender_id),
            "text": text,
            "isRead": False,
            "createdAt": now,
            "readAt": None,
        }