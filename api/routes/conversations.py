from fastapi import Depends,APIRouter
from sqlalchemy.orm import Session

from ..auth.dependencies import get_current_user
from ..Database.models import User,Conversation
from ..Database.connection import get_db
from ..services.conversation import create_conversation,get_conversation,get_messages,add_message

router = APIRouter(
    prefix = "/conversations",
    tags = ["Conversations"]
)

@router.post("/")
def create_new_conversation(current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
    conversation = create_conversation(db = db, user_id = current_user.id, title = "New Conversation")
    return {
        "id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
        "updated_at": conversation.updated_at.isoformat() if conversation.updated_at else None
    }

@router.get("/")
def get_my_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.created_at.desc()).all()

    return [
        {
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
            "updated_at": conversation.updated_at.isoformat() if conversation.updated_at else None
        }
        for conversation in conversations
    ]

@router.post("/{conversation_id}")
def get_my_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = get_conversation(
        db =db,
        conversation_id=conversation_id,
        user_id = current_user.id
    )

    return {
        "id": conversation.id,
        "title":conversation.title,
        "user_id":conversation.user_id,
        "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
        "updated_at": conversation.updated_at.isoformat() if conversation.updated_at else None
    }
@router.get("/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = get_conversation(
        db = db,
        conversation_id = conversation_id,
        user_id = current_user.id
    )

    messages = get_messages(
        db = db,
        conversation = conversation
    )

    return[{
        "id": message.id,
        "role": message.role,
        "content": message.content,
        "created_at": message.created_at
    }
    for message in messages]

