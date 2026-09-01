from fastapi import HTTPException,status
from sqlalchemy.orm import Session
from langchain_core.vectorstores import VectorStore
import os
from ingestion import get_vector_store

from ..Database.models import AcademicDocument,User

def create_document(db:Session,
                    current_user: User,
                    filename: str,
                    destination_path: str,
                    pdf_hash: str,
                    college: str,
                    department: str,
                    subject: str,
                    semester: int,
                    unit: int
                    ):
    academic_docment = AcademicDocument(
        user_id = current_user.id,
        filename = filename,
        file_path = destination_path,
        file_hash = pdf_hash,
        college = college,
        department = department,
        subject = subject,
        semester = semester,
        unit = unit,
        status = "processing"
    )

    db.add(academic_docment)
    db.commit()
    db.refresh(academic_docment)

    return academic_docment

def update_status(db:Session,chunks:int,document: AcademicDocument):

    document.chunk_count = chunks
    document.status = "completed"

    db.commit()
    db.refresh(document)

    return document 

def mark_as_failed(db:Session,document: AcademicDocument):
    document.status = "failed"
    db.commit()
    db.refresh(document)
    return document

# def get_user_documents(db:Session, user_id: int,document_id: int):
#     matching_documents = db.query(AcademicDocument).filter(
#         AcademicDocument.user_id == user_id,
        
#     ).all()

    return matching_documents
def get_user_document(db:Session, user_id: int,document_id: int):
    document = db.query(AcademicDocument).filter(
        AcademicDocument.id == document_id,
        AcademicDocument.user_id == user_id        

    ).first()

    if document:
        return document
    else:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "Document not found."
        )

def delete_document_vectors(document_id: int, vector_store: VectorStore):
    return vector_store.delete(
        where= {
            "document_id": document_id
        }
    )

def delete_document_pdf(file_path: str):

    if os.path.exists(file_path):
        return os.remove(file_path)

def delete_from_db(db:Session,document:AcademicDocument):
    db.delete(document)
    db.commit()

def delete_document(db:Session,document:AcademicDocument):
    vector_store = get_vector_store()
    delete_document_vectors(document_id=document.id,vector_store = vector_store)
    delete_document_pdf(file_path=document.file_path)
    delete_from_db(db = db,document = document)
