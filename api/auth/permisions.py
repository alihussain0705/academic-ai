from fastapi import Depends,HTTPException,status

from .dependencies import get_current_user
from ..Database.models import User

def require_role(*allowed_roles: str):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail = "You are not allowed to perform this action."
            )
        return current_user
    return role_checker