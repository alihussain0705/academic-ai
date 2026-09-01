from pydantic import BaseModel

class UserProfile(BaseModel):
    user_id: str
    department: str
    semester: int
    college: str
    subject: str