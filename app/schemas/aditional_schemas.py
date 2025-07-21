from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, List
from enum import Enum

class MovementType(str, Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    ADJUSTMENT = "adjustment"
    RETURN = "return"

# Dashboard Schemas
class DashboardMetrics(BaseModel):
    daily_sales: int
    daily_revenue: float
    total_products: int
    low_stock_count: int

class BestSellingProduct(BaseModel):
    product_id: int
    product_name: str
    product_code: str
    total_sold: int
    total_revenue: float

# Report Schemas
class SalesReportItem(BaseModel):
    date: date
    total_sales: int
    total_revenue: float
    total_products_sold: int

class ProductReportItem(BaseModel):
    product_id: int
    product_name: str
    product_code: str
    total_sold: int
    total_revenue: float
    current_stock: int

# Low Stock Item Schema
class LowStockItem(BaseModel):
    product_id: int
    product_code: str
    product_name: str
    current_stock: int
    min_stock: int
    supplier_name: Optional[str] = None