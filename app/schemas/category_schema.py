from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, List
from enum import Enum

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None

class Category(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True