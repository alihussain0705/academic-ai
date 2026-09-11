"""
One-time safe re-index: re-ingest existing PDFs into ChromaDB.

This script reads every AcademicDocument from PostgreSQL, verifies the PDF
file exists on disk, and calls ingest_pdf() with the same metadata that
handle_upload.py would have used.  It does NOT create, modify, or delete
any PostgreSQL records or PDF files.

Usage:
    python reindex.py          # dry-run (default): show what would be re-indexed
    python reindex.py --apply  # actually re-index
"""

import sys
import os
import argparse
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))

from api.Database.connection import SessionLocal
from api.Database.models import AcademicDocument
from metadata import normalize_metadata
from ingestion import ingest_pdf
from utils.logger import logger


def build_metadata(doc: AcademicDocument) -> dict:
    """Build the metadata dict that handle_upload.py would have passed to ingest_pdf."""
    return normalize_metadata({
        "document_id": doc.id,
        "college": doc.college,
        "department": doc.department,
        "semester": doc.semester,
        "subject": doc.subject,
        "unit": doc.unit,
        "original_filename": doc.filename,
        "stored_filename": Path(doc.file_path).name,
    })


def main():
    parser = argparse.ArgumentParser(description="Re-index existing PDFs into ChromaDB")
    parser.add_argument("--apply", action="store_true", help="Actually perform re-index (default: dry-run)")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        docs = db.query(AcademicDocument).filter(
            AcademicDocument.status == "completed"
        ).all()
    finally:
        db.close()

    if not docs:
        print("No completed AcademicDocument records found.")
        return

    print(f"\nFound {len(docs)} AcademicDocument records with status=completed.\n")
    print(f"{'ID':>4}  {'Subject':<20}  {'File Exists':>11}  {'Chunks':>6}  File Path")
    print("-" * 100)

    valid = []
    missing = []
    for doc in docs:
        exists = os.path.isfile(doc.file_path)
        status = "YES" if exists else "MISSING"
        chunks = doc.chunk_count or 0
        print(f"{doc.id:>4}  {doc.subject:<20}  {status:>11}  {chunks:>6}  {doc.file_path}")
        if exists:
            valid.append(doc)
        else:
            missing.append(doc)

    print(f"\nSummary: {len(valid)} PDFs available, {len(missing)} missing from disk.")

    if missing:
        print("\nMissing files (will be skipped):")
        for doc in missing:
            print(f"  - ID {doc.id}: {doc.file_path}")

    if not valid:
        print("\nNo PDFs to re-index. Exiting.")
        return

    if not args.apply:
        print(f"\nDRY RUN: would re-index {len(valid)} PDFs.")
        print("Run with --apply to actually re-index.")
        return

    print(f"\nRe-indexing {len(valid)} PDFs into ChromaDB...\n")

    succeeded = 0
    failed = 0
    for doc in valid:
        meta = build_metadata(doc)
        pdf_path = doc.file_path
        print(f"  Re-indexing ID={doc.id} subject={doc.subject} file={Path(pdf_path).name} ... ", end="", flush=True)
        try:
            result = ingest_pdf(pdf_path, meta)
            print(f"OK ({result['chunks']} chunks)")
            succeeded += 1
        except Exception as e:
            print(f"FAILED: {e}")
            logger.exception(f"Re-index failed for document ID={doc.id}")
            failed += 1

    print(f"\nDone. {succeeded} succeeded, {failed} failed.")
    print("PostgreSQL records were NOT modified.")


if __name__ == "__main__":
    main()
