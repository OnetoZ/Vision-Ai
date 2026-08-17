import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey
from database import Base


class SEOFinding(Base):
    __tablename__ = "seo_findings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    page_url = Column(String, nullable=False)
    rule = Column(String, nullable=False)  # e.g. MISSING_META_DESCRIPTION
    category = Column(String, nullable=False)  # Technical/On-page/Content/Performance/Structured Data
    severity = Column(String, nullable=False)  # critical/high/medium/low/info
    description = Column(Text, nullable=False)
    points_lost = Column(Float, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
