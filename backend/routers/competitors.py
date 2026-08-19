import uuid
import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from database import get_db, async_session
from models.user import User
from models.competitor import Competitor
from models.crawl import CrawlRun
from schemas.competitor import CompetitorCreate, CompetitorResponse, CompetitorWithScan
from auth import get_current_user
from crawler.crawler import run_crawl
from models.company_profile import CompanyProfile

router = APIRouter(prefix="/competitors", tags=["competitors"])


def get_db_factory():
    """Return the session maker for background tasks."""
    return async_session()


@router.get("", response_model=List[dict])
async def get_competitors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Competitor).where(Competitor.user_id == current_user.id)
    competitors = (await db.execute(stmt)).scalars().all()
    
    response = []
    for c in competitors:
        # Get latest scan
        scan_stmt = select(CrawlRun).where(CrawlRun.competitor_id == c.id).order_by(CrawlRun.created_at.desc()).limit(1)
        scan_res = await db.execute(scan_stmt)
        latest_scan = scan_res.scalar_one_or_none()
        
        # Get profile
        prof_stmt = select(CompanyProfile).where(CompanyProfile.competitor_id == c.id)
        prof = (await db.execute(prof_stmt)).scalar_one_or_none()

        comp_dict = {
            "id": c.id,
            "user_id": c.user_id,
            "name": c.name,
            "url": c.url,
            "status": c.status,
            "industry": prof.industry if prof else c.industry,
            "competitor_type": c.competitor_type,
            "last_scanned_at": c.last_scanned_at.isoformat() if c.last_scanned_at else None,
            "brand_name": prof.brand_name if prof else c.name,
            "business_type": prof.business_type if prof else None,
            "description": prof.description if prof else None,
            "target_customers": prof.target_customers if prof else [],
            "score": 85, # Placeholder
            "latest_crawl_status": latest_scan.status if latest_scan else "unknown",
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        }
        response.append(comp_dict)
        
    return response


@router.post("", response_model=CompetitorResponse)
async def create_competitor(
    request: CompetitorCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count_stmt = select(Competitor).where(Competitor.user_id == current_user.id)
    count_res = await db.execute(count_stmt)
    if len(count_res.scalars().all()) >= 10:
        raise HTTPException(status_code=400, detail="Maximum limit of 10 competitors reached")

    new_comp = Competitor(
        user_id=current_user.id,
        name=request.name,
        url=request.url,
        industry=request.industry,
        competitor_type=request.competitor_type,
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

    background_tasks.add_task(run_crawl, new_comp.id, crawl_id, get_db_factory)

    return CompetitorResponse.model_validate(new_comp)


@router.delete("/{competitor_id}")
async def delete_competitor(
    competitor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Competitor).where(Competitor.id == competitor_id, Competitor.user_id == current_user.id)
    result = await db.execute(stmt)
    comp = result.scalar_one_or_none()
    
    if not comp:
        raise HTTPException(status_code=404, detail="Competitor not found")
        
    await db.execute(delete(Competitor).where(Competitor.id == competitor_id))
    await db.commit()
    
    return {"success": True}


@router.post("/{competitor_id}/rescan")
async def rescan_competitor(
    competitor_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Competitor).where(Competitor.id == competitor_id, Competitor.user_id == current_user.id)
    result = await db.execute(stmt)
    comp = result.scalar_one_or_none()
    
    if not comp:
        raise HTTPException(status_code=404, detail="Competitor not found")
        
    scan_stmt = select(CrawlRun).where(
        CrawlRun.competitor_id == competitor_id, 
        CrawlRun.status.in_(["queued", "crawling", "analyzing"])
    )
    active_scan = (await db.execute(scan_stmt)).scalar_one_or_none()
    if active_scan:
        raise HTTPException(status_code=400, detail="A scan is already in progress")

    comp.status = "crawling"
    
    crawl_id = str(uuid.uuid4())
    crawl_run = CrawlRun(
        id=crawl_id,
        competitor_id=comp.id,
        status="queued"
    )
    db.add(crawl_run)
    await db.commit()

    background_tasks.add_task(run_crawl, comp.id, crawl_id, get_db_factory)
    
    return {"success": True, "crawl_id": crawl_id}
