import os
from fastapi import Depends,HTTPException,APIRouter,status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..Database.models import User
from ..auth.permisions import require_role 
from ..Database.connection import get_db
from ..auth.dependencies import get_current_user
from ingestion import get_vector_store

from ..services.academicdocuments import get_user_documents, get_user_document, delete_document, get_class_documents, get_class_document

router = APIRouter(
    prefix = "/documents",
    tags = ["Documents"]
)

@router.get("/documents")
def get_documents(db:Session = Depends(get_db),current_user: User = Depends(require_role("professor", "admin"))):
    return get_user_documents(
        db = db,
        user_id = current_user.id
    )

@router.get("/documents/{document_id}")
def get_document_bu_id(document_id: int,current_user: User = Depends(require_role("professor", "admin")),db:Session = Depends(get_db)):
    return get_user_document(
        document_id = document_id,
        user_id = current_user.id,
        db = db
    )

@router.get("/class")
def get_class_materials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    documents = get_class_documents(db=db, user=current_user)
    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "subject": doc.subject,
            "unit": doc.unit,
            "created_at": doc.created_at.isoformat() if doc.created_at else None
        }
        for doc in documents
    ]

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = get_class_document(db=db, document_id=document_id, user=current_user)
    
    if not document.file_path or not os.path.exists(document.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk."
        )
    
    return FileResponse(
        path=document.file_path,
        filename=document.filename,
        media_type="application/pdf"
    )

@router.delete("/document-delete/{document_id}")
def delete_document_by_id(document_id:int,db:Session = Depends(get_db),current_user: User = Depends(require_role("professor", "admin"))):
    document = get_user_document(db = db, user_id=current_user.id,document_id=document_id)
    delete_document(db = db, document = document)
    return {
        "messages":"Document deleted successfully"
    }        

