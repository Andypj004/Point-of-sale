from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import models.product

class InventoryMovement(Base):
    __tablename__ = 'inventory_movements'
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    movement_type = Column(String(20), nullable=False)  # sale, purchase, adjustment, return
    quantity = Column(Integer, nullable=False)  # positive for in, negative for out
    reference_type = Column(String(20), nullable=True)  # sale, purchase_order, adjustment
    reference_id = Column(Integer, nullable=True)  # ID of the related record
    movement_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    
    # Relationships
    product = relationship("Product", back_populates="inventory_movements")