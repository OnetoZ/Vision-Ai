import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from models.pricing import PricingSnapshot, PricingPlan
from models.crawl import CrawlRun
from auth import get_current_user
from models.competitor import Competitor

router = APIRouter(prefix="/pricing", tags=["pricing"])


@router.get("")
async def get_all_pricing(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comp_stmt = select(Competitor).where(Competitor.user_id == current_user.id)
    competitors = (await db.execute(comp_stmt)).scalars().all()
    
    all_plans = []
    
    for comp in competitors:
        plan_stmt = select(PricingPlan).where(PricingPlan.competitor_id == comp.id)
        plans_db = (await db.execute(plan_stmt)).scalars().all()
        
        if not plans_db:
            # dummy
            all_plans.append({
                "id": f"{comp.id}-dummy-1",
                "competitor_id": comp.id,
                "competitor_name": comp.name,
                "competitor_url": comp.url,
                "name": "Basic",
                "currency": "₹",
                "price": 2499,
                "tier": "Entry",
                "lastChange": "2 weeks ago",
                "strategy": "Penetration"
            })
        else:
            for i, p in enumerate(plans_db):
                all_plans.append({
                    "id": p.id,
                    "competitor_id": comp.id,
                    "competitor_name": comp.name,
                    "competitor_url": comp.url,
                    "name": p.plan_name,
                    "currency": p.currency,
                    "price": p.price or 0,
                    "billing_period": p.billing_period,
                    "tier": ["Entry", "Mid", "Premium"][i % 3] if i < 3 else "Enterprise",
                    "lastChange": "Recently",
                    "strategy": "Value-Based" if p.features else "Balanced",
                    "features": json.loads(p.features) if p.features else []
                })
            
    return {"plans": all_plans}


@router.get("/{competitor_id}")
async def get_pricing(
    competitor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crawl_stmt = select(CrawlRun).where(CrawlRun.competitor_id == competitor_id).order_by(CrawlRun.created_at.desc()).limit(1)
    latest_crawl = (await db.execute(crawl_stmt)).scalar_one_or_none()
    
    if not latest_crawl:
        return {"pricing": None}
        
    stmt = select(PricingSnapshot).where(PricingSnapshot.crawl_run_id == latest_crawl.id)
    snapshot = (await db.execute(stmt)).scalar_one_or_none()
    
    return {"pricing": snapshot}
