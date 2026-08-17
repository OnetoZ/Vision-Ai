import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from database import Base


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=True)
    insight_type = Column(String, nullable=False)  # opportunity/threat/trend/recommendation
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    action_items = Column(Text, nullable=True)  # JSON array
    priority = Column(String, default="medium")  # high/medium/low
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
