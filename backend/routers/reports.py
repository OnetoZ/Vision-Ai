import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from models.competitor import Competitor
from auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportCreate(BaseModel):
    name: Optional[str] = "Executive Market Summary"
    report_type: Optional[str] = "weekly"
    description: Optional[str] = "Comprehensive competitive crawl and SEO analysis"
    format: Optional[str] = "pdf"
    schedule: Optional[str] = "Weekly on Monday"


@router.get("", response_model=List[Dict[str, Any]])
async def get_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comp_stmt = select(Competitor).where(Competitor.user_id == current_user.id)
    competitors = (await db.execute(comp_stmt)).scalars().all()
    comp_names = ", ".join([c.name for c in competitors[:3]]) if competitors else "Competitors"

    now = datetime.now(timezone.utc).isoformat()
    return [
        {
            "id": "rep-weekly-1",
            "name": "Weekly Competitive Intelligence Briefing",
            "report_type": "weekly",
            "description": f"Automated 7-day summary tracking pricing shifts, newly crawled pages, and momentum for {comp_names}.",
            "last_generated": now,
            "schedule": "Every Monday at 9:00 AM",
            "format": "pdf",
            "created_at": now
        },
        {
            "id": "rep-monthly-1",
            "name": "Monthly SEO & Technical Audit Benchmark",
            "report_type": "monthly",
            "description": f"Deep comparison of technical SEO scores, Core Web Vitals, and structured data gaps for {comp_names}.",
            "last_generated": now,
            "schedule": "1st of every month",
            "format": "csv",
            "created_at": now
        }
    ]


@router.post("")
async def create_report(
    payload: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc).isoformat()
    return {
        "id": f"rep-{uuid.uuid4().hex[:8]}",
        "name": payload.name,
        "report_type": payload.report_type,
        "description": payload.description,
        "last_generated": now,
        "schedule": payload.schedule,
        "format": payload.format,
        "created_at": now
    }

