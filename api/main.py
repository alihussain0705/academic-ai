from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.chat import router as chat_router
from .routes.upload import router as upload_router
from .routes.auth import router as auth_router
from .routes.conversations import router as conversation_router
from .routes.documents import router as documents_router
app = FastAPI(
    title = "Academic AI platform",
    description="AI-Powered academic platform for researching,summarization,review and write.",
    version = "1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(conversation_router)
app.include_router(documents_router)

@app.get("/")
def root():
    return {
        "message":"Welcome to Academic AI Platform"
    }

