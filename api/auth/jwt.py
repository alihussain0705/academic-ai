import os

from datetime import datetime,timedelta,timezone,UTC
import jwt

from dotenv import load_dotenv

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM","HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))

if not JWT_SECRET_KEY:
    raise RuntimeError("Secret Key is not set")

def create_access_token(user_id: int, role: str, name: str) -> str:
    expire = datetime.now(UTC)+timedelta(
        minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "name": name,
        "exp": expire
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm = JWT_ALGORITHM
    )

def decode_access_token(token:str) -> dict:
    return jwt.decode(
        token,
        JWT_SECRET_KEY,
        algorithms = JWT_ALGORITHM
    )