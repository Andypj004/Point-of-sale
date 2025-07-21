from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import models.supplier
import models.purchase_order_detail
from database import Base

class PurchaseOrder(Base):
    __tablename__ = 'purchase_orders'
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), nullable=False, unique=True)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'), nullable=False)
    order_date = Column(DateTime, default=datetime.utcnow)
    expected_delivery = Column(Date, nullable=True)
    received_date = Column(DateTime, nullable=True)
    status = Column(String(20), default='pending')  # pending, in_transit, delivered, cancelled
    total_amount = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="purchase_orders")
    purchase_order_details = relationship("PurchaseOrderDetail", back_populates="purchase_order", cascade="all, delete-orphan")