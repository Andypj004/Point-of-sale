from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, List
from enum import Enum

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str
    contact_person: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None

class Supplier(SupplierBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True