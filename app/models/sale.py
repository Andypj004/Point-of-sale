from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import models.sale_detail
from database import Base

class Sale(Base):
    __tablename__ = 'sales'
    
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(DateTime, nullable=False, default=datetime.utcnow)  # Changed to DateTime
    total = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)  # Added tax support
    discount_amount = Column(Float, default=0.0)  # Added discount support
    payment_method = Column(String(50), default='cash')  # cash, card, transfer
    customer_name = Column(String(100), nullable=True)  # Optional customer info
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sale_details = relationship("SaleDetail", back_populates="sale", cascade="all, delete-orphan")