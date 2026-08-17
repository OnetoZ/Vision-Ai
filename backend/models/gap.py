import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from database import Base


class CompetitorGap(Base):
    __tablename__ = "competitor_gaps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=True)
    category = Column(String, nullable=False)  # Technical/Content/Performance/Structured Data/Metadata/Internal Linking
    issue_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
    severity = Column(String, default="medium")
    impact_score = Column(Integer, default=50)
    status = Column(String, default="open")  # open/in_progress/resolved/ignored
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
