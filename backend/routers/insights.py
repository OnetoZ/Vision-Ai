import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from models.insight import AIInsight
from models.competitor import Competitor
from auth import get_current_user
import google.generativeai as genai
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/insights", tags=["insights"])

# Configure Gemini
if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)


@router.get("")
async def get_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(AIInsight).where(AIInsight.user_id == current_user.id).order_by(AIInsight.created_at.desc())
    insights = (await db.execute(stmt)).scalars().all()
    return {"insights": insights}


@router.post("/generate")
async def generate_insights(
    competitor_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key not configured")
        
    # In a real scenario, we would gather the competitor data and send it to Gemini
    # For now, we simulate a basic generative call
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = "Generate 2 strategic insights for a web agency monitoring competitors. Format as JSON array of objects with title, description, insight_type (opportunity/threat), priority (high/medium/low)."
        response = model.generate_content(prompt)
        # Parse the JSON response... (simplified here for brevity)
        
        # Save a mock one for demonstration
        new_insight = AIInsight(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            competitor_id=competitor_id,
            insight_type="opportunity",
            title="Generated Insight",
            description="This is a generated insight based on recent data.",
            priority="medium"
        )
        db.add(new_insight)
        await db.commit()
        
        return {"success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
