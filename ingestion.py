from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import CHUNK_SIZE, CHUNK_OVERLAP,embedding_model,CHROMA_DB_PATH
import os
from langchain_chroma import Chroma
from utils.logger import logger
from ocr import ocr_pdf


def read_pdf(pdf_path: str):
    loader = PyPDFLoader(pdf_path)

    documents = loader.load()

    total_chars = sum(
        len(doc.page_content)
        for doc in documents
    )

    logger.info(f"Number of PDF pages: {len(documents)}")
    logger.info(f"Total extracted characters: {total_chars}")

    if total_chars < 50:
        logger.info("Little or no text detected. Starting OCR...")

        documents = ocr_pdf(pdf_path)

        ocr_chars = sum(
            len(doc.page_content)
            for doc in documents
        )

        logger.info(
            f"OCR extracted characters: {ocr_chars}"
        )

    return documents

def add_metadata(documents:list[Document],metadata: dict)-> list[Document]:
    """
    Adds user-provided metadata to every LangChain Document.
    Existing metadata is preserved.
    """
    for doc in documents:
        doc.metadata.update(metadata)
    return documents

def split_documents(documents):
    document_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len
    )

    total_chars = sum(
        len(doc.page_content)
        for doc in documents
    )

    logger.info(f"Characters before chunking: {total_chars}")

    chunked_document = document_splitter.split_documents(documents)

    logger.info(f"Number of chunks: {len(chunked_document)}")

    return chunked_document

def store_documents(chunked_document):
    if os.path.exists(CHROMA_DB_PATH):
        vector_store = Chroma(
            persist_directory=CHROMA_DB_PATH,
            embedding_function = embedding_model
        )
        vector_store.add_documents(chunked_document)
    else:
        vector_store = Chroma.from_documents(
            documents = chunked_document,
            embedding=embedding_model,
            persist_directory=CHROMA_DB_PATH
        )
    print("Documents stored successfully.")
    return vector_store

def get_vector_store():
    return Chroma(
        persist_directory=CHROMA_DB_PATH,
        embedding_function=embedding_model
    )

def ingest_pdf(pdf_path:str, metadata: dict):
    documents = read_pdf(pdf_path)
    documents = add_metadata(documents, metadata)
    chunked_documents = split_documents(documents)
    store_documents(chunked_documents)
    return {
        "status":"success",
        "chunks":len(chunked_documents)
    }