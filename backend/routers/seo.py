from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from models.score import SEOScore
from models.finding import SEOFinding
from models.crawl import CrawlRun
from auth import get_current_user

router = APIRouter(prefix="/seo", tags=["seo"])


@router.get("/scores/{competitor_id}")
async def get_seo_scores(
    competitor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get latest crawl
    crawl_stmt = select(CrawlRun).where(CrawlRun.competitor_id == competitor_id).order_by(CrawlRun.created_at.desc()).limit(1)
    crawl_res = await db.execute(crawl_stmt)
    latest_crawl = crawl_res.scalar_one_or_none()
    
    if not latest_crawl:
        return {"scores": None, "historical": []}
        
    # Get latest score
    score_stmt = select(SEOScore).where(SEOScore.crawl_run_id == latest_crawl.id)
    score_res = await db.execute(score_stmt)
    latest_score = score_res.scalar_one_or_none()
    
    # Get historical scores (last 10)
    hist_stmt = select(SEOScore).where(SEOScore.competitor_id == competitor_id).order_by(SEOScore.created_at.desc()).limit(10)
    hist_res = await db.execute(hist_stmt)
    history = hist_res.scalars().all()
    
    return {
        "latest": latest_score,
        "historical": history[::-1]  # chronological order
    }


@router.get("/findings/{competitor_id}")
async def get_seo_findings(
    competitor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get latest crawl
    crawl_stmt = select(CrawlRun).where(CrawlRun.competitor_id == competitor_id).order_by(CrawlRun.created_at.desc()).limit(1)
    crawl_res = await db.execute(crawl_stmt)
    latest_crawl = crawl_res.scalar_one_or_none()
    
    if not latest_crawl:
        return {"findings": []}
        
    # Get findings for latest crawl
    findings_stmt = select(SEOFinding).where(SEOFinding.crawl_run_id == latest_crawl.id).order_by(SEOFinding.severity)
    findings_res = await db.execute(findings_stmt)
    findings = findings_res.scalars().all()
    
    return {"findings": findings}
