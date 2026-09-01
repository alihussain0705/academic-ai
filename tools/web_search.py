import os
from config import tavily_client
from langchain_core.tools import tool
from langchain_core.documents import Document

@tool("web_search_tool")
def web_search_tool(question: str):
    """This is a Tool used to search WEB as per the question asked by User"""
    print("WEB TOOL CALLED")
    response = tavily_client.search(question)

    web_search_documents = []

    for result in response.get("results",[]):
        doc = Document(
            page_content=result.get("content"),
            metadata= {
                "title":result.get("title"),
                "source":result.get("source"),
                "score":result.get("score")
            }
        )
        web_search_documents.append(doc)
        return str(web_search_documents)