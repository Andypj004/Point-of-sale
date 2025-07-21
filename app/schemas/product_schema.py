from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from schemas.category_schema import Category
from schemas.supplier_schema import Supplier

# Product Schemas
class ProductBase(BaseModel):
    name: str
    price: float
    stock: int = 0
    min_stock: int = 10
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    code: str

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    code: Optional[str] = None

class Product(ProductBase):
    id: int
    code: str
    created_at: datetime
    updated_at: datetime
    category: Optional[Category] = None
    supplier: Optional[Supplier] = None
    
    class Config:
        from_attributes = True