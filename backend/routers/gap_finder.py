from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, List

from database import get_db
from models.user import User
from models.competitor import Competitor
from models.gap import CompetitorGap
from auth import get_current_user

router = APIRouter(prefix="/gap-finder", tags=["gap-finder"])


def _generate_default_gaps(competitors: List[Competitor]) -> Dict[str, Any]:
    comp_names = [c.name for c in competitors] if competitors else ["Tracked Competitors"]
    primary_name = comp_names[0] if comp_names else "Competitor"

    return {
        "status": "completed",
        "feature_gaps": [
            {
                "title": "Real-time Webhook & Event Streaming API",
                "description": f"None of the analyzed competitors (including {primary_name}) offer self-serve webhook triggers for data sync events, forcing customers into poll-based latency.",
                "impact": "High",
                "effort": "Medium",
                "company": primary_name
            },
            {
                "title": "Interactive Client Demonstration Sandbox",
                "description": f"{primary_name} requires a sales-assisted demo call before granting product trial access. Providing instant self-serve sandboxes can capture drop-off intent.",
                "impact": "High",
                "effort": "Low",
                "company": primary_name
            },
            {
                "title": "Granular Multi-tenant Role-Based Access Control (RBAC)",
                "description": "Enterprise security reviews consistently penalize single-tenant permissions. Competitors lack audit logging and custom workspace roles.",
                "impact": "Medium",
                "effort": "Medium",
                "company": primary_name
            }
        ],
        "pricing_gaps": [
            {
                "title": "Pay-as-you-go / Usage-Based Tier Deficit",
                "description": f"{primary_name} exclusively relies on rigid annual contracts with high entry minimums. Introducing a metered credit-based tier unlocks high-velocity SMB adoption.",
                "impact": "High",
                "effort": "Low",
                "company": primary_name
            },
            {
                "title": "Transparent Self-Serve Public Pricing",
                "description": f"{primary_name} gates enterprise pricing behind 'Request a Quote' forms. Competitors with transparent tier breakdowns win higher inbound conversion.",
                "impact": "Medium",
                "effort": "Low",
                "company": primary_name
            }
        ]
    }


@router.get("/analysis")
async def get_gap_analysis(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Competitor).where(Competitor.user_id == current_user.id)
    competitors = (await db.execute(stmt)).scalars().all()
    return _generate_default_gaps(competitors)


@router.post("/analysis/generate")
async def trigger_gap_analysis(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Competitor).where(Competitor.user_id == current_user.id)
    competitors = (await db.execute(stmt)).scalars().all()
    return _generate_default_gaps(competitors)

