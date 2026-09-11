from fastapi import APIRouter,Depends
from ..schemas import ChatRequest,ChatResponse
from ..services.handle_chat import handle_chat
from fastapi import HTTPException
from ..user import UserProfile
from metadata import normalize_text, resolve_subject
from utils.logger import logger
from ..auth.dependencies import get_current_user
from ..Database.models import User
from ..Database.connection import get_db
from ..services.conversation import get_conversation,get_messages,add_message,generate_title,rename_conversation
from sqlalchemy.orm import Session
router = APIRouter(
    prefix = '/chat',
    tags = ['Chat']
)

@router.post('/', )
def chat(request: ChatRequest,current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
    try:
        conversation = get_conversation(
            db = db,
            conversation_id = request.conversation_id,
            user_id = current_user.id
        )
        thread_id = conversation.thread_id

        add_message(
            db = db,
            conversation = conversation,
            role = "user",
            content = request.task
        )

        if not conversation.title or conversation.title == "New Conversation":
            new_title = generate_title(request.task)
            rename_conversation(db=db, conversation=conversation, title=new_title)

        user = UserProfile(
            user_id = str(current_user.id),
            college = normalize_text(current_user.college),
            department = normalize_text(current_user.department),
            semester = current_user.semester,
            subject = resolve_subject(request.subject)
        )
        logger.info(
            f"Saving chat message | "
            f"user={current_user.id} | "
            f"conversation={conversation.id}"
        )

        result = handle_chat(
            task = request.task,
            thread_id = thread_id,
            user = user
        )

        add_message(
            db = db,
            conversation = conversation,
            role = "assistant",
            content = result['response']
        )
        return ChatResponse(**result)
    except HTTPException:
        raise

    except Exception as e:
        logger.exception(f"Chat failed: {e}")

        raise HTTPException(
            status_code=500,
            detail="The AI service is temporarily down. Please try again later."
        )