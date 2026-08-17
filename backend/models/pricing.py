import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey
from database import Base


class PricingSnapshot(Base):
    __tablename__ = "pricing_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)
    avg_price = Column(Float, nullable=True)
    product_count = Column(Integer, nullable=True)
    price_details = Column(Text, nullable=True)  # JSON
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
