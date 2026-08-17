from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from models.pricing import PricingSnapshot
from models.crawl import CrawlRun
from auth import get_current_user

router = APIRouter(prefix="/pricing", tags=["pricing"])


@router.get("/{competitor_id}")
async def get_pricing(
    competitor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get latest crawl
    crawl_stmt = select(CrawlRun).where(CrawlRun.competitor_id == competitor_id).order_by(CrawlRun.created_at.desc()).limit(1)
    latest_crawl = (await db.execute(crawl_stmt)).scalar_one_or_none()
    
    if not latest_crawl:
        return {"pricing": None}
        
    # Get pricing snapshot
    stmt = select(PricingSnapshot).where(PricingSnapshot.crawl_run_id == latest_crawl.id)
    snapshot = (await db.execute(stmt)).scalar_one_or_none()
    
    return {"pricing": snapshot}
