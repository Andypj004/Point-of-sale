from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from schemas.product_schema import Product

# Sale Detail Schemas
class SaleDetailBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class SaleDetailCreate(SaleDetailBase):
    pass

class SaleDetail(SaleDetailBase):
    id: int
    subtotal: float
    product: Product
    
    class Config:
        from_attributes = True