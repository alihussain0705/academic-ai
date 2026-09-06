import shutil
from config import MAX_FILE_SIZE
from fastapi import UploadFile,HTTPException,status,Depends
import uuid
import hashlib
from pathlib import Path
from ingestion import ingest_pdf
from ..auth.permisions import require_role
from ..Database.models import User, AcademicDocument
from sqlalchemy.orm import Session
from .academicdocuments import create_document,update_status,mark_as_failed
from utils.logger import logger


def handle_upload(file: UploadFile,
    college: str,
    department: str,
    semester: int,
    subject: str,
    unit: int,
    current_user: User,
    db: Session
    ): 

    file_id = uuid.uuid4()
    extension = Path(file.filename).suffix
    filename = f"{file_id}{extension}"  

    upload_dir = Path("uploads")
    upload_dir.mkdir(parents = True, exist_ok=True)
    destination_path = upload_dir / filename
    
    if(file.content_type != "application/pdf"):
        raise HTTPException(
                    status_code = status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail = "Only PDF are allowed"
                )

    with open(destination_path, "wb") as f:
        f.write(file.file.read())

    with open(destination_path,"rb") as f:
        pdf_hash = hashlib.file_digest(f, "sha256").hexdigest()

    existing_document = db.query(AcademicDocument).filter(
        AcademicDocument.file_hash == pdf_hash
    ).first()

    if existing_document:
        raise HTTPException(
            status_code = status.HTTP_409_CONFLICT,
            detail = "PDF already exists"
        )

    
    
    file.file.seek(0,2)
    size = file.file.tell()
    file.file.seek(0)
    if(size == 0):
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = "The file is empty"
        )
    if(size>MAX_FILE_SIZE):
        raise HTTPException(
            status_code = status.HTTP_413_CONTENT_TOO_LARGE,
            detail = "file size is too large"
        )
    with open(destination_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    document = create_document(
            db = db,
            current_user = current_user,
            filename = filename,
            destination_path=str(destination_path),
            pdf_hash=pdf_hash,
            college = college,
            department = department,
            subject = subject,
            semester = semester,
            unit = unit 
        )
    metadata = {
    "document_id": document.id,
    "college": college,
    "department": department,
    "semester": semester,
    "subject": subject,
    "unit": unit,
    "original_filename": file.filename,
    "stored_filename": filename,
    }
    try: 
        ingest = ingest_pdf(str(destination_path),metadata)

        update_status(
            db =db,
            chunks = ingest["chunks"],
            document = document
        )
    except Exception as e:

        mark_as_failed(
            db=db,
            document=document
        )

        logger.exception("Document processing Failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document processing failed. Please try again later."
        )

    return {
    "message": "Document uploaded successfully",
    "stored_filename": filename,
    "original_filename": file.filename,
    "chunks": ingest['chunks']
}

