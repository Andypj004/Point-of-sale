from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class DailySummary(Base):
    __tablename__ = 'daily_summaries'
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True)
    total_sales = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
    total_products_sold = Column(Integer, default=0)
    total_transactions = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)