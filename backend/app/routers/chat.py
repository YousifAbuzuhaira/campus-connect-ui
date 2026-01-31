from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from typing import List, Optional
from datetime import datetime
import math

from app.database import get_chats_collection, get_messages_collection, get_users_collection
from app.models.chat import ChatModel, MessageModel
from app.schemas.chat import Chat, ChatCreate, Message, MessageCreate, ChatResponse, ChatWithMessages
from app.schemas.user import User
from app.schemas.response import SuccessResponse
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=ChatResponse)
async def get_user_chats(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user)
):
    """Get user's chat conversations"""
    chats_collection = await get_chats_collection()
    users_collection = await get_users_collection()
    
    # Build query for chats where user is participant
    query = {
        "$or": [
            {"participantAId": ObjectId(current_user.id)},
            {"participantBId": ObjectId(current_user.id)}
        ]
    }
    
    # Count total chats
    total = await chats_collection.count_documents(query)
    total_pages = math.ceil(total / per_page) if total > 0 else 0 # Calculate total pages
    
    # Get chats with pagination
    skip = (page - 1) * per_page
    cursor = chats_collection.find(query).sort("lastMessageAt", -1).skip(skip).limit(per_page)
    
    chats = []
    async for chat in cursor:
        chat_data = ChatModel.chat_helper(chat)
        
        # Get other participant's info
        other_user_id = chat["participantBId"] if str(chat["participantAId"]) == current_user.id else chat["participantAId"]
        other_user = await users_collection.find_one({"_id": other_user_id})
        
        if other_user:
            if str(chat["participantAId"]) == current_user.id:
                chat_data["participant_b_name"] = other_user.get("fullName")
            else:
                chat_data["participant_a_name"] = other_user.get("fullName")
        
        chats.append(chat_data)
    
    return ChatResponse(
        chats=chats,
        total=total,
        page=page, # Add page to response
        per_page=per_page, # Add per_page to response
        total_pages=total_pages # Add total_pages to response
    )

@router.post("/", response_model=SuccessResponse)
async def create_chat(
    chat_data: ChatCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new chat conversation"""
    chats_collection = await get_chats_collection()
    
    # Check if chat already exists between these users
    existing_chat = await chats_collection.find_one({
        "$or": [
            {
                "participantAId": ObjectId(current_user.id),
                "participantBId": ObjectId(chat_data.participant_b_id)
            },
            {
                "participantAId": ObjectId(chat_data.participant_b_id),
                "participantBId": ObjectId(current_user.id)
            }
        ]
    })
    
    if existing_chat:
        return SuccessResponse(
            message="Chat already exists",
            data={"chat_id": str(existing_chat["_id"])}
        )
    
    # Create new chat
    chat_dict = ChatModel.create_chat_dict(current_user.id, chat_data.participant_b_id)
    result = await chats_collection.insert_one(chat_dict)
    
    if result.inserted_id:
        return SuccessResponse(
            message="Chat created successfully",
            data={"chat_id": str(result.inserted_id)}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to create chat"
    )

@router.get("/{chat_id}/messages", response_model=List[Message])
async def get_chat_messages(
    chat_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Messages per page"),
    current_user: User = Depends(get_current_user)
):
    """Get messages for a chat"""
    if not ChatModel.validate_object_id(chat_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid chat ID"
        )
    
    chats_collection = await get_chats_collection()
    messages_collection = await get_messages_collection()
    
    # Verify user is participant in this chat
    chat = await chats_collection.find_one({
        "_id": ObjectId(chat_id),
        "$or": [
            {"participantAId": ObjectId(current_user.id)},
            {"participantBId": ObjectId(current_user.id)}
        ]
    })
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or access denied"
        )
    
    # Get messages with pagination (oldest first for chronological order)
    skip = (page - 1) * per_page
    cursor = messages_collection.find({"chatId": ObjectId(chat_id)}).sort("createdAt", 1).skip(skip).limit(per_page)
    
    messages = []
    async for message in cursor:
        messages.append(MessageModel.message_helper(message))
    
    return messages

@router.post("/{chat_id}/messages", response_model=SuccessResponse)
async def send_message(
    chat_id: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user)
):
    """Send a message in a chat"""
    # Prevent admins from sending messages
    if current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot send messages"
        )
    
    if not ChatModel.validate_object_id(chat_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid chat ID"
        )
    
    chats_collection = await get_chats_collection()
    messages_collection = await get_messages_collection()
    
    # Verify user is participant in this chat
    chat = await chats_collection.find_one({
        "_id": ObjectId(chat_id),
        "$or": [
            {"participantAId": ObjectId(current_user.id)},
            {"participantBId": ObjectId(current_user.id)}
        ]
    })
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or access denied"
        )
    
    # Create message
    message_dict = MessageModel.create_message_dict(chat_id, current_user.id, message_data.text)
    result = await messages_collection.insert_one(message_dict)
    
    if result.inserted_id:
        # Update chat with last message info
        now = datetime.utcnow()
        await chats_collection.update_one(
            {"_id": ObjectId(chat_id)},
            {
                "$set": {
                    "lastMessage": message_data.text,
                    "lastMessageAt": now,
                    "updatedAt": now
                },
                "$inc": {
                    f"unreadCount.{'b' if str(chat['participantAId']) == current_user.id else 'a'}": 1
                }
            }
        )
        
        return SuccessResponse(
            message="Message sent successfully",
            data={"message_id": str(result.inserted_id)}
        )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to send message"
    )

@router.put("/{chat_id}/mark-read", response_model=SuccessResponse)
async def mark_messages_read(
    chat_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark all messages in a chat as read"""
    if not ChatModel.validate_object_id(chat_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid chat ID"
        )
    
    chats_collection = await get_chats_collection()
    messages_collection = await get_messages_collection()
    
    # Verify user is participant in this chat
    chat = await chats_collection.find_one({
        "_id": ObjectId(chat_id),
        "$or": [
            {"participantAId": ObjectId(current_user.id)},
            {"participantBId": ObjectId(current_user.id)}
        ]
    })
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or access denied"
        )
    
    # Mark messages as read
    now = datetime.utcnow()
    await messages_collection.update_many(
        {
            "chatId": ObjectId(chat_id),
            "senderId": {"$ne": ObjectId(current_user.id)},
            "isRead": False
        },
        {
            "$set": {
                "isRead": True,
                "readAt": now
            }
        }
    )
    
    # Reset unread count for this user
    user_key = "a" if str(chat["participantAId"]) == current_user.id else "b"
    await chats_collection.update_one(
        {"_id": ObjectId(chat_id)},
        {"$set": {f"unreadCount.{user_key}": 0}}
    )
    
    return SuccessResponse(
        message="Messages marked as read"
    )