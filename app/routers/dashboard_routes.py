from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List
from database import get_db
import schemas.aditional_schemas as schemas
from crud import sale_crud, product_crud

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/metrics", response_model=schemas.DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    today = date.today()
    daily_sales = sale_crud.get_daily_sales_count(db, today)
    daily_revenue = sale_crud.get_daily_revenue(db, today)
    total_products = product_crud.get_total_products(db)
    low_stock_count = product_crud.get_low_stock_count(db)
    return schemas.DashboardMetrics(
        daily_sales=daily_sales,
        daily_revenue=daily_revenue,
        total_products=total_products,
        low_stock_count=low_stock_count
    )

@router.get("/best-selling", response_model=List[schemas.BestSellingProduct])
def get_best_selling_products(limit: int = 10, db: Session = Depends(get_db)):
    thirty_days_ago = datetime.now().date()
    results = sale_crud.get_best_selling_products(db, thirty_days_ago, limit)
    return [
        schemas.BestSellingProduct(
            product_id=result.id,
            product_name=result.name,
            product_code=result.code,
            total_sold=result.total_sold or 0,
            total_revenue=float(result.total_revenue or 0)
        )
        for result in results
    ]