import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from database import Base


class ProductSnapshot(Base):
    __tablename__ = "product_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    page_url = Column(String, nullable=False)
    product_name = Column(String, nullable=True)
    price = Column(String, nullable=True)
    currency = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
