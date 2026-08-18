import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    competitor_id = Column(String, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    crawl_run_id = Column(String, ForeignKey("crawl_runs.id"), nullable=True)
    
    name = Column(String, nullable=False)
    url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    subcategory = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    features = Column(Text, nullable=True) # JSON list
    benefits = Column(Text, nullable=True) # JSON list
    price = Column(String, nullable=True)
    currency = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    sku = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    product_schema = Column(Text, nullable=True) # JSON
    images = Column(Text, nullable=True) # JSON list
    variants = Column(Text, nullable=True) # JSON list
    
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

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
