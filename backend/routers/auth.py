import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from database import get_db, async_session
from models.user import User
from models.competitor import Competitor
from models.crawl import CrawlRun
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse, GoogleLoginRequest
from auth import hash_password, verify_password, create_access_token, get_current_user
from config import get_settings
from crawler.crawler import run_crawl

router = APIRouter(prefix="/auth", tags=["auth"])


def get_db_factory():
    return async_session


async def ensure_self_competitor(user: User, db: AsyncSession, background_tasks: BackgroundTasks):
    stmt = select(Competitor).where(Competitor.user_id == user.id, Competitor.competitor_type == "self")
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        return

    brand_name = user.brand_name or user.full_name or "My Company"
    website_url = user.website_url or f"https://{brand_name.lower().replace(' ', '')}.com"
    
    new_comp = Competitor(
        user_id=user.id,
        name=brand_name,
        url=website_url,
        industry=user.industry or "General",
        competitor_type="self",
        status="crawling"
    )
    db.add(new_comp)
    await db.commit()
    await db.refresh(new_comp)

    crawl_id = str(uuid.uuid4())
    crawl_run = CrawlRun(
        id=crawl_id,
        competitor_id=new_comp.id,
        status="queued"
    )
    db.add(crawl_run)
    await db.commit()

    if background_tasks:
        background_tasks.add_task(run_crawl, new_comp.id, crawl_id, get_db_factory)


@router.post("/register")
async def register(request: RegisterRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    is_admin_user = request.email.lower() == "onetoztechnologies@gmail.com"
    
    new_user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        full_name=request.full_name,
        mobile_number=request.mobile_number,
        brand_name=request.brand_name,
        website_url=request.website_url,
        industry=request.industry,
        target_audience=request.target_audience,
        is_admin=is_admin_user,
        is_approved=is_admin_user, # Only auto-approve admin
    )
    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Registration failed")

    # Create self competitor automatically
    await ensure_self_competitor(new_user, db, background_tasks)

    token = create_access_token(new_user.id, new_user.email)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(new_user))


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    is_admin_user = request.email.lower() == "onetoztechnologies@gmail.com"

    if not user:
        if is_admin_user:
            user = User(
                email=request.email,
                password_hash=hash_password(request.password),
                full_name=request.email.split('@')[0],
                is_admin=True,
                is_approved=True,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            raise HTTPException(status_code=401, detail="Account does not exist. Please sign up.")
    else:
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/google", response_model=TokenResponse)
async def google_login(request: GoogleLoginRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    settings = get_settings()
    client_id = settings.VITE_GOOGLE_CLIENT_ID
    try:
        idinfo = id_token.verify_oauth2_token(
            request.credential, 
            google_requests.Request(), 
            client_id, 
            clock_skew_in_seconds=10
        )
        email = idinfo['email']
        name = idinfo.get('name', '')
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    is_admin_user = email.lower() == "onetoztechnologies@gmail.com"

    if not user:
        if is_admin_user:
            user = User(
                email=email,
                password_hash=hash_password(os.urandom(16).hex()),
                full_name=name,
                is_admin=True,
                is_approved=True,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            raise HTTPException(status_code=400, detail="Please use the Sign Up tab to provide your company details first.")

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


class SetupProfileRequest(BaseModel):
    brand_name: str
    website_url: str
    industry: str
    target_audience: str

@router.post("/setup-profile")
async def setup_profile(
    request: SetupProfileRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    current_user.brand_name = request.brand_name
    current_user.website_url = request.website_url
    current_user.industry = request.industry
    current_user.target_audience = request.target_audience
    db.add(current_user)
    await db.commit()
    
    await ensure_self_competitor(current_user, db, background_tasks)
    return {"success": True}

@router.get("/me", response_model=UserResponse)
async def get_me(background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await ensure_self_competitor(current_user, db, background_tasks)
    return UserResponse.model_validate(current_user)

class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    mobile_number: str | None = None
    brand_name: str | None = None
    website_url: str | None = None
    industry: str | None = None

@router.put("/profile")
async def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if request.full_name is not None: current_user.full_name = request.full_name
    if request.mobile_number is not None: current_user.mobile_number = request.mobile_number
    if request.brand_name is not None: current_user.brand_name = request.brand_name
    if request.website_url is not None: current_user.website_url = request.website_url
    if request.industry is not None: current_user.industry = request.industry
    
    db.add(current_user)
    await db.commit()
    return {"success": True}
