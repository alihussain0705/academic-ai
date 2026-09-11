from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from tavily import TavilyClient
from langgraph.types import RetryPolicy


load_dotenv()
LLM_PROVIDER = "GROQ"
if LLM_PROVIDER == "GEMINI":
    llm = ChatGoogleGenerativeAI(
    model = 'gemini-2.5-flash',
    api_key = os.getenv("GOOGLE_API_KEY")
)
elif LLM_PROVIDER == "GROQ":
    llm = ChatGroq(
        model = "openai/gpt-oss-120b",
        api_key=os.getenv("GROQ_API_KEY")
    )
embedding_model = HuggingFaceEmbeddings(
    model_name="BAAI/bge-small-en-v1.5"
)

tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
TOP_K = 3
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chromadb")
MAX_FILE_SIZE = 10485760


RESEARCH_RETRY = RetryPolicy(max_attempts=3)
SUMMARIZER_RETRY = RetryPolicy(max_attempts=2)
REVIEWER_RETRY = RetryPolicy(max_attempts=2)
WRITER_RETRY = RetryPolicy(max_attempts=2)