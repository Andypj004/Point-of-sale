from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import schemas.aditional_schemas as schemas
from crud import product_crud, purchase_order_crud

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/low-stock", response_model=List[schemas.LowStockItem])
def get_low_stock_items(db: Session = Depends(get_db)):
    results = product_crud.get_low_stock_items(db)
    return [
        schemas.LowStockItem(
            product_id=result.id,
            product_code=result.code,
            product_name=result.name,
            current_stock=result.stock,
            min_stock=result.min_stock,
            supplier_name=result.supplier_name
        )
        for result in results
    ]

@router.post("/restock/{product_id}")
def create_restock_order(
    product_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    purchase_order, product_name_or_error = purchase_order_crud.create_restock_order(db, product_id, quantity)
    if not purchase_order:
        raise HTTPException(status_code=404, detail=product_name_or_error)
    return {"message": f"Restock order created for {product_name_or_error}", "order_id": purchase_order.id}