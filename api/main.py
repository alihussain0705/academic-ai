import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routes.chat import router as chat_router
from .routes.upload import router as upload_router
from .routes.auth import router as auth_router
from .routes.conversations import router as conversation_router
from .routes.documents import router as documents_router
from utils.logger import logger
app = FastAPI(
    title = "Academic AI platform",
    description="AI-Powered academic platform for researching,summarization,review and write.",
    version = "1.0.0"
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(conversation_router)
app.include_router(documents_router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

@app.get("/")
def root():
    return {
        "message":"Welcome to Academic AI Platform"
    }

