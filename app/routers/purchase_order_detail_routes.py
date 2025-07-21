from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas.purchase_order_detail_schema as schemas
import crud.purchase_order_detail_crud as crud
from database import get_db
from typing import List

router = APIRouter(prefix="/purchase-order-details", tags=["purchase-order-details"])

@router.get("/order/{order_id}", response_model=List[schemas.PurchaseOrderDetail])
def read_order_details(order_id: int, db: Session = Depends(get_db)):
    return crud.get_order_details(db, order_id)

@router.patch("/{detail_id}/receive", response_model=schemas.PurchaseOrderDetail)
def receive_items(
    detail_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be positive"
        )
    
    db_detail = crud.update_received_quantity(db, detail_id, quantity)
    if not db_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order detail with id {detail_id} not found"
        )
    return db_detail