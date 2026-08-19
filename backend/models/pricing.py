import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey
from database import Base


class PricingPlan(Base):
    __tablename__ = "pricing_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id"), nullable=True)
    
    plan_name = Column(String, nullable=False)
    price = Column(Float, nullable=True)
    currency = Column(String, nullable=True)
    billing_period = Column(String, nullable=True)
    monthly_price = Column(Float, nullable=True)
    annual_price = Column(Float, nullable=True)
    discount = Column(String, nullable=True)
    features = Column(Text, nullable=True) # JSON list
    limits = Column(Text, nullable=True) # JSON list
    target_customer = Column(String, nullable=True)
    cta = Column(String, nullable=True)
    pricing_type = Column(String, nullable=True) # "contact_sales", "not_public", "public"
    
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

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
