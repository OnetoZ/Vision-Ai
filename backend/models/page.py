import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey
from database import Base


class Page(Base):
    __tablename__ = "pages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String, nullable=False)
    status_code = Column(Integer, nullable=True)
    final_url = Column(String, nullable=True)
    redirect_chain = Column(Text, nullable=True)  # JSON array
    response_time_ms = Column(Integer, nullable=True)
    page_size_bytes = Column(Integer, nullable=True)
    content_type = Column(String, nullable=True)
    # SEO fields
    title = Column(String, nullable=True)
    title_length = Column(Integer, nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_description_length = Column(Integer, nullable=True)
    h1 = Column(Text, nullable=True)  # JSON array
    h2 = Column(Text, nullable=True)  # JSON array
    h3 = Column(Text, nullable=True)  # JSON array
    canonical_url = Column(String, nullable=True)
    meta_robots = Column(String, nullable=True)
    word_count = Column(Integer, nullable=True)
    internal_links_count = Column(Integer, nullable=True)
    external_links_count = Column(Integer, nullable=True)
    images_count = Column(Integer, nullable=True)
    images_without_alt = Column(Integer, nullable=True)
    has_og_tags = Column(Boolean, default=False)
    has_twitter_tags = Column(Boolean, default=False)
    schema_types = Column(Text, nullable=True)  # JSON array
    raw_content_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
