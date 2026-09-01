from pydantic import BaseModel,EmailStr,Field

class ChatRequest(BaseModel):
    task: str
    conversation_id: int
    subject: str


class ChatResponse(BaseModel):
    response: str
    thread_id: str

class UploadResponse(BaseModel):
    message: str
    filename: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str
    college: str
    semester: str
    role: str = "student"

class RegisterResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ResearchRoute(BaseModel):
    source: str = Field(
        description="Choose exactly one: RAG or WEB"
    )
    reason: str = Field(
        description="Brief reason for the choice"
    )
