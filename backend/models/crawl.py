import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from database import Base


class CrawlRun(Base):
    __tablename__ = "crawl_runs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, default="queued")  # queued/crawling/analyzing/completed/failed
    pages_discovered = Column(Integer, default=0)
    pages_analyzed = Column(Integer, default=0)
    pages_failed = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
