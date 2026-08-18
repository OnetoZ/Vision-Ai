import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON
from database import Base


class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id"), nullable=True)
    
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    content_type = Column(String, nullable=True) # Blog, Guide, Case Study, Resource, FAQ, News
    publication_date = Column(String, nullable=True)
    modified_date = Column(String, nullable=True)
    author = Column(String, nullable=True)
    word_count = Column(Integer, default=0)
    headings = Column(JSON, nullable=True) # list of H2/H3
    topic = Column(String, nullable=True)
    category = Column(String, nullable=True)
    
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
