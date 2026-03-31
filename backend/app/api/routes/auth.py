from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.core.database import get_database
from app.core.security import create_access_token, verify_password
from app.models.user import serialize_user
from app.schemas.auth import LoginRequest, TokenResponse


router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    database = get_database()
    user = await database.users.find_one({"email": payload.email})

    if user is None or user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if payload.email != settings.admin_email or not verify_password(
        payload.password, user["hashed_password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    serialized_user = serialize_user(user)
    access_token = create_access_token(payload.email, serialized_user["id"])

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.jwt_expire_minutes * 60,
        admin=serialized_user,
    )
