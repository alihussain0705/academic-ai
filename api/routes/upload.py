from fastapi import APIRouter,Depends
from fastapi import UploadFile,File,Form
from ..schemas import ChatResponse
from ..services.handle_upload import handle_upload
from ..Database.models import User
from ..auth.permisions import require_role
from ..Database.connection import get_db
from sqlalchemy.orm import Session

router = APIRouter(
    prefix = '/upload',
    tags = ['Upload']
)

@router.post('/')
def upload(
    file: UploadFile = File(...),
    college: str = Form(...),
    department: str = Form(...),
    semester: int = Form(...),
    subject: str = Form(...),
    unit: int = Form(...),
    current_user: User = Depends(require_role("professor", "admin")),
    db: Session = Depends(get_db)
    ):

    return handle_upload(
        file = file,
        college = college,
        department = department,
        semester = semester,
        unit = unit,
        subject = subject,
        current_user = current_user,
        db = db
    )