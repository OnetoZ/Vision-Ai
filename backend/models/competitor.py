import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from database import Base


class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    industry = Column(String, default="General")
    competitor_type = Column(String, default="direct")  # direct/indirect/aspirational
    status = Column(String, default="active")  # active/paused/error/crawling/analyzing
    scan_frequency = Column(String, default="weekly")
    last_scanned_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
