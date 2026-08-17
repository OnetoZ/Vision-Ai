import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from database import Base


class ContentSnapshot(Base):
    __tablename__ = "content_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    page_url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    meta_description = Column(Text, nullable=True)
    content_hash = Column(String, nullable=True)
    word_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
