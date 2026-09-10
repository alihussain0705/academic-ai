from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from ..auth.jwt import create_access_token
from ..Database.connection import get_db
from ..Database.models import User
from ..auth.security import hash_password,verify_password
from ..schemas import RegisterRequest,RegisterResponse
from ..schemas import LoginRequest,LoginResponse
from ..auth.dependencies import get_current_user
from ..auth.permisions import require_role

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register",response_model=RegisterResponse)
def register(request:RegisterRequest,db:Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        User.email == request.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    user = User(
        name = request.name,
        email = request.email,
        password_hash = hash_password(request.password),
        role = "student",
        department = request.department,
        college = request.college,
        semester = request.semester
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login",response_model=LoginResponse)
def login(request:LoginRequest, db:Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    if not verify_password(
        request.password,user.password_hash
    ):
        raise HTTPException(
            status_code = 401,
            detail = "Invalid Email or Password"
        )

    access_token = create_access_token(user.id, user.role, user.name)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# @router.get("/me")
# def get_me(current_user: User = Depends(get_current_user)):
#     return{
#         "id":current_user.id,
#         "name":current_user.name,
#         "department":current_user.department,
#         "role":current_user.role,
#         "semester":current_user.semester,
#         "college":current_user.college,
#         "email":current_user.email
#     }

# @router.get("/professor-test")
# def professor_test(current_user: User = Depends(require_role("professor"))):
#     return {
#         "message": "You are an authorized professor",
#         "user_id": current_user.id
#     }