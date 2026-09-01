from fastapi import HTTPException,status
from sqlalchemy.orm import Session
import uuid

from ..Database.models import Conversation,Message

def create_conversation(
        db: Session,
        user_id: int,
        title: str | None = None
):
    thread_id = str(uuid.uuid4())
    conversation = Conversation(
        user_id = user_id,
        thread_id = thread_id,
        title = title
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation

def get_conversation(
        db: Session,
        conversation_id: int,
        user_id: int
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "Conversation not found."
        )
    return conversation

def add_message(
        db: Session,
        conversation: Conversation,
        role: str,
        content: str
):
    message = Message(
        conversation_id = conversation.id,
        role = role,
        content = content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message

def get_messages(db: Session,conversation: Conversation):
    return db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(
        Message.created_at.asc()
    ).all()
