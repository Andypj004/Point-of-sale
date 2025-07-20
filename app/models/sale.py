from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class Sale(Base):
    __tablename__ = 'sales'
    
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    total = Column(Float, nullable=False)
    
    def __repr__(self):
        return f"<Sale(id={self.id}, fecha={self.fecha}, total={self.total})>"