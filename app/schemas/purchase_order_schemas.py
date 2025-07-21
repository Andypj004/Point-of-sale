from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from schemas.purchase_order_detail_schema import PurchaseOrderDetailCreate, PurchaseOrderDetail
from schemas.supplier_schema import Supplier


class OrderStatus(str, Enum):
    PENDING = "pending"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# Purchase Order Schemas
class PurchaseOrderBase(BaseModel):
    supplier_id: int
    expected_delivery: Optional[date] = None
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderDetailCreate]

class PurchaseOrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    received_date: Optional[datetime] = None
    notes: Optional[str] = None

class PurchaseOrder(PurchaseOrderBase):
    id: int
    order_number: str
    order_date: datetime
    status: OrderStatus
    total_amount: float
    created_at: datetime
    supplier: Supplier
    purchase_order_details: List[PurchaseOrderDetail]
    
    class Config:
        from_attributes = True