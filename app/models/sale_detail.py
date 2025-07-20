from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class SaleDetail(Base):
    __tablename__ = 'sale_details'
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, nullable=False)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)
    
    def __repr__(self):
        return f"<SaleDetail(id={self.id}, sale_id={self.sale_id}, product_id={self.product_id}, quantity={self.quantity}, price={self.price})>"