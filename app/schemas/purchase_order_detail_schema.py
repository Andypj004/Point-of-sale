from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, List
from schemas.product_schema import Product

# Purchase Order Detail Schemas
class PurchaseOrderDetailBase(BaseModel):
    product_id: int
    quantity_ordered: int
    unit_cost: float

class PurchaseOrderDetailCreate(PurchaseOrderDetailBase):
    pass

class PurchaseOrderDetail(PurchaseOrderDetailBase):
    id: int
    quantity_received: int
    total_cost: float
    product: Product
    
    class Config:
        from_attributes = True