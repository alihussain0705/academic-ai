from fastapi import Depends,HTTPException,APIRouter,status
from sqlalchemy.orm import Session
from ..Database.models import User
from ..auth.permisions import require_role 
from ..Database.connection import get_db
from ..auth.dependencies import get_current_user
from ingestion import get_vector_store

from ..services.academicdocuments import get_user_document,delete_document

router = APIRouter(
    prefix = "/documents",
    tags = ["Documents"]
)

# @router.get("/documents")
# def get_documents(user_id:int ,db:Session = Depends(get_db),current_user: User = Depends(require_role("professor", "admin"))):
#     return get_user_documents(
#         db = db,
#         user_id = current_user.id
#     )

@router.get("/documents/{document_id}")
def get_document_bu_id(document_id: int,current_user: User = Depends(require_role("professor", "admin")),db:Session = Depends(get_db)):
    return get_user_document(
        document_id = document_id,
        user_id = current_user.id,
        db = db
    )
@router.delete("/document-delete/{document_id}")
def delete_document_by_id(document_id:int,db:Session = Depends(get_db),current_user: User = Depends(require_role("professor", "admin"))):
    document = get_user_document(db = db, user_id=current_user.id,document_id=document_id)
    delete_document(db = db, document = document)
    return {
        "messages":"Document deleted successfully"
    }        

