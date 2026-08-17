from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from models.crawl import CrawlRun
from schemas.competitor import CrawlStatusResponse
from auth import get_current_user

router = APIRouter(prefix="/crawls", tags=["crawls"])


@router.get("/{crawl_id}/status", response_model=CrawlStatusResponse)
async def get_crawl_status(
    crawl_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(CrawlRun).where(CrawlRun.id == crawl_id)
    result = await db.execute(stmt)
    crawl = result.scalar_one_or_none()
    
    if not crawl:
        raise HTTPException(status_code=404, detail="Crawl not found")
        
    return CrawlStatusResponse.model_validate(crawl)


@router.get("/latest/{competitor_id}", response_model=CrawlStatusResponse)
async def get_latest_crawl(
    competitor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(CrawlRun).where(CrawlRun.competitor_id == competitor_id).order_by(CrawlRun.created_at.desc()).limit(1)
    result = await db.execute(stmt)
    crawl = result.scalar_one_or_none()
    
    if not crawl:
        raise HTTPException(status_code=404, detail="No crawls found for this competitor")
        
    return CrawlStatusResponse.model_validate(crawl)
