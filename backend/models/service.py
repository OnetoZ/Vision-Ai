import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id"), nullable=True)
    
    name = Column(String, nullable=False)
    url = Column(String, nullable=True)
    description = Column(String, nullable=True)
    target_customer = Column(String, nullable=True)
    features = Column(JSON, nullable=True) # list
    benefits = Column(JSON, nullable=True) # list
    industries = Column(JSON, nullable=True) # list
    pricing = Column(String, nullable=True)
    
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
