from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import schemas.aditional_schemas as schemas
from crud import sale_crud, product_crud

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/sales", response_model=List[schemas.SalesReportItem])
def get_sales_report(
    start_date: str = Query(..., description="Start date for the report"),
    end_date: str = Query(..., description="End date for the report"),
    db: Session = Depends(get_db)
):
    results = sale_crud.get_sales_report(db, start_date, end_date)
    return [
        schemas.SalesReportItem(
            date=result.date,
            total_sales=result.total_sales or 0,
            total_revenue=float(result.total_revenue or 0),
            total_products_sold=result.total_products_sold or 0
        )
        for result in results
    ]

@router.get("/products", response_model=List[schemas.ProductReportItem])
def get_products_report(
    start_date: Optional[str] = Query(None, description="Start date for the report"),
    end_date: Optional[str] = Query(None, description="End date for the report"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    results = product_crud.get_products_report(db, start_date, end_date, category_id)
    return [
        schemas.ProductReportItem(
            product_id=result.id,
            product_name=result.name,
            product_code=result.code,
            total_sold=result.total_sold or 0,
            total_revenue=float(result.total_revenue or 0),
            current_stock=result.stock
        )
        for result in results
    ]