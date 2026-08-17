from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from database import get_db
from models.user import User
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    new_user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        full_name=request.full_name,
        mobile_number=request.mobile_number,
        brand_name=request.brand_name,
        website_url=request.website_url,
        industry=request.industry,
        target_audience=request.target_audience,
    )
    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Registration failed")

    # Generate token
    token = create_access_token(new_user.id, new_user.email)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(user.id, user.email)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
