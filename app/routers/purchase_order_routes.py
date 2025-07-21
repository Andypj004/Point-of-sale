from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas.purchase_order_schemas as schemas
import crud.purchase_order_crud as crud
import models.purchase_order as models
from database import get_db
from typing import Optional, List

router = APIRouter(prefix="/purchase-orders", tags=["purchase-orders"])

@router.get("/", response_model=List[schemas.PurchaseOrder])
def read_orders(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.PurchaseOrder)
    if status:
        query = query.filter(models.PurchaseOrder.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{order_id}", response_model=schemas.PurchaseOrder)
def read_order(order_id: int, db: Session = Depends(get_db)):
    order = crud.get_purchase_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    return order

@router.post("/", response_model=schemas.PurchaseOrder, status_code=201)
def create_order(order: schemas.PurchaseOrderCreate, db: Session = Depends(get_db)):
    # Validar proveedor
    supplier = db.query(models.Supplier).filter(
        models.Supplier.id == order.supplier_id
    ).first()
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supplier not found"
        )
    
    # Validar productos
    for item in order.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with id {item.product_id} not found"
            )
    
    return crud.create_purchase_order(db, order)

@router.put("/{order_id}", response_model=schemas.PurchaseOrder)
def update_order(
    order_id: int,
    order: schemas.PurchaseOrderUpdate,
    db: Session = Depends(get_db)
):
    db_order = crud.update_purchase_order(db, order_id, order)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    return db_order

@router.patch("/{order_id}/receive", response_model=schemas.PurchaseOrder)
def receive_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    db_order = crud.update_purchase_order(db, order_id, schemas.PurchaseOrderUpdate(status="delivered"))
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    return db_order