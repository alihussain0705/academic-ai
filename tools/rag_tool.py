from langchain_core.tools import tool
from langchain_chroma import Chroma
from config import CHROMA_DB_PATH, embedding_model, TOP_K
from metadata import normalize_query_metadata
from utils.logger import logger

vector_store = Chroma(
    persist_directory=CHROMA_DB_PATH,
    embedding_function=embedding_model
)
print("COUNT:", vector_store._collection.count())

data = vector_store._collection.get(
    limit=5,
    include=["metadatas"]
)

print("METADATA:")
for m in data["metadatas"]:
    print(m)


@tool("rag_tool")
def rag_tool(
    question: str,
    college: str,
    department: str,
    semester: int,
    subject: str
) -> str:
    """
    Search the academic vector database for documents relevant to the student's question.
    """

    print("RAG TOOL CALLED")
    print("COLLEGE:", repr(college), type(college))
    print("DEPARTMENT:", repr(department), type(department))
    print("SEMESTER:", repr(semester), type(semester))
    print("SUBJECT:", repr(subject), type(subject))
    print("========== RAG INPUT ==========")
    
    print("college:", repr(college))
    print("department:", repr(department))
    print("semester:", repr(semester), type(semester))
    print("subject:", repr(subject))
    print("================================")

    meta = normalize_query_metadata(
        college=college,
        department=department,
        semester=semester,
        subject=subject,
    )

    print("\nACTUAL CHROMA METADATA:")
    data = vector_store._collection.get(
        limit=10,
        include=["metadatas"]
    )

    for metadata in data["metadatas"]:
        print(metadata)

    logger.info(
        f"RAG metadata | college={meta['college']}, "
        f"department={meta['department']}, "
        f"semester={meta['semester']}, "
        f"subject={meta['subject']}"
    )

    retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={
        "k": TOP_K,
        "filter": {
            "$and": [
                {"department": meta["department"]},
                {"college": meta["college"]},
                {"semester": meta["semester"]},
                {"subject": meta["subject"]}
            ]
        }
    }
)

    retrieved_documents = retriever.invoke(question)

    logger.info(
        f"RAG retrieved {len(retrieved_documents)} documents"
    )

    if not retrieved_documents:
        return "No relevant academic material was found."

    results = []

    for doc in retrieved_documents:

        logger.info(
            f"RAG document metadata: {doc.metadata}"
        )

        document_data = (
            f"--- Source: {doc.metadata.get('original_filename', 'Unknown')} "
            f"| Unit: {doc.metadata.get('unit', 'N/A')} "
            f"| Page: {doc.metadata.get('page_label', 'N/A')} ---\n"
            f"{doc.page_content}"
        )

        results.append(document_data)

    return "\n\n".join(results)