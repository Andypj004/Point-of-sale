from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from schemas.sale_detail_schema import SaleDetailCreate, SaleDetail

class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    TRANSFER = "transfer"
    
    
# Sale Schemas
class SaleBase(BaseModel):
    payment_method: PaymentMethod = PaymentMethod.CASH
    customer_name: Optional[str] = None
    notes: Optional[str] = None
    tax_amount: float = 0.0
    discount_amount: float = 0.0

class SaleCreate(SaleBase):
    items: List[SaleDetailCreate]

class Sale(SaleBase):
    id: int
    fecha: datetime
    total: float
    created_at: datetime
    sale_details: List[SaleDetail]
    
    class Config:
        from_attributes = True