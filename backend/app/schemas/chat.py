from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class ChatBase(BaseModel):
    participant_a_id: str
    participant_b_id: str

class ChatCreate(ChatBase):
    pass

class Chat(ChatBase):
    id: str
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: Dict[str, int] = {"a": 0, "b": 0}
    created_at: datetime
    updated_at: datetime
    participant_a_name: Optional[str] = None
    participant_b_name: Optional[str] = None

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    chat_id: str
    text: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str
    sender_id: str
    is_read: bool = False
    created_at: datetime
    read_at: Optional[datetime] = None
    sender_name: Optional[str] = None

    class Config:
        from_attributes = True

class ChatWithMessages(Chat):
    messages: List[Message] = []

class ChatResponse(BaseModel):
    chats: List[Chat]
    total: int