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


import json
from models.finding import SEOFinding

@router.post("/generate")
async def generate_insights(
    competitor_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key not configured")
        
    try:
        # 1. Fetch real data
        # Fetch competitors
        comp_stmt = select(Competitor).where(Competitor.user_id == current_user.id)
        if competitor_id:
            comp_stmt = comp_stmt.where(Competitor.id == competitor_id)
        competitors = (await db.execute(comp_stmt)).scalars().all()
        
        if not competitors:
            raise HTTPException(status_code=404, detail="No competitors found to generate insights for.")

        # Fetch recent findings
        comp_ids = [c.id for c in competitors]
        findings_stmt = select(SEOFinding).where(SEOFinding.competitor_id.in_(comp_ids)).order_by(SEOFinding.created_at.desc()).limit(50)
        findings = (await db.execute(findings_stmt)).scalars().all()

        # Build context
        context_data = {
            "competitors": [{"id": c.id, "name": c.name, "url": c.url, "industry": c.industry} for c in competitors],
            "recent_seo_findings": [
                {
                    "competitor_id": f.competitor_id,
                    "url": f.page_url,
                    "issue": f.rule,
                    "category": f.category,
                    "severity": f.severity,
                    "description": f.description
                } for f in findings
            ]
        }

        model = genai.GenerativeModel('gemini-3.6-flash')
        prompt = f"""
You are an expert SEO and competitive intelligence AI. Analyze the following competitor data and recent SEO findings.
Generate 3-5 highly detailed, strategic insights. For each insight, provide actionable suggestions on how we can improve our own strategy or capitalize on competitor weaknesses.

Context Data:
{json.dumps(context_data, indent=2)}

Respond ONLY with a valid JSON array of objects. Do not use markdown blocks like ```json. Each object must strictly match this schema:
{{
  "title": "String (Short, punchy title)",
  "description": "String (Detailed explanation of the insight based on the real data)",
  "insight_type": "String (opportunity, threat, trend, or recommendation)",
  "priority": "String (high, medium, or low)",
  "action_items": ["String (Suggestion 1)", "String (Suggestion 2)"],
  "competitor_id": "String (Optional, the ID of the related competitor if applicable, or null)"
}}
"""
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up possible markdown formatting
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        try:
            insights_data = json.loads(response_text)
        except json.JSONDecodeError:
            print("Failed to parse JSON:", response_text)
            raise HTTPException(status_code=500, detail="Failed to parse AI response into valid JSON")

        if not isinstance(insights_data, list):
            insights_data = [insights_data]

        # 3. Store insights
        for item in insights_data:
            new_insight = AIInsight(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                competitor_id=item.get("competitor_id"),
                insight_type=item.get("insight_type", "opportunity"),
                title=item.get("title", "Generated Insight"),
                description=item.get("description", ""),
                priority=item.get("priority", "medium"),
                action_items=json.dumps(item.get("action_items", []))
            )
            db.add(new_insight)
            
        await db.commit()
        return {"success": True, "count": len(insights_data)}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

