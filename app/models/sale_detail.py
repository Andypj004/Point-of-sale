from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import models.sale
from database import Base

class SaleDetail(Base):
    __tablename__ = 'sale_details'
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey('sales.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)  # Price at time of sale
    subtotal = Column(Float, nullable=False)
    
    # Relationships
    sale = relationship("Sale", back_populates="sale_details")
    product = relationship("Product", back_populates="sale_details")