import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    mobile_number = Column(String, nullable=True)
    brand_name = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    target_audience = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
