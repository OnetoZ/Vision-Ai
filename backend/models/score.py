import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from database import Base


class SEOScore(Base):
    __tablename__ = "seo_scores"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    overall = Column(Integer, nullable=True)
    technical = Column(Integer, nullable=True)
    on_page = Column(Integer, nullable=True)
    performance = Column(Integer, nullable=True)
    content = Column(Integer, nullable=True)
    structured_data = Column(Integer, nullable=True)
    internal_linking = Column(Integer, nullable=True)
    crawlability = Column(Integer, nullable=True)
    total_issues = Column(Integer, default=0)
    critical_issues = Column(Integer, default=0)
    high_issues = Column(Integer, default=0)
    medium_issues = Column(Integer, default=0)
    low_issues = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
