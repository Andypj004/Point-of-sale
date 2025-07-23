from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas.purchase_order_detail_schema as schemas
import crud.purchase_order_detail_crud as crud
import models
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

@router.post("/seed", status_code=201)
def seed_purchase_order_details(db: Session = Depends(get_db)):
    orders = db.query(models.PurchaseOrder).limit(10).all()
    products = db.query(models.Product).limit(10).all()
    for i in range(10):
        detail = models.PurchaseOrderDetail(
            purchase_order_id=orders[i % len(orders)].id,
            product_id=products[i % len(products)].id,
            quantity_ordered=5 + i,
            unit_cost=products[i % len(products)].price * 0.8,
            total_cost=(5 + i) * products[i % len(products)].price * 0.8
        )
        db.add(detail)
    db.commit()
    return {"message": "10 purchase order details seeded"}