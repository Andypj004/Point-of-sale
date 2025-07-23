from sqlalchemy.orm import Session
from datetime import datetime
import models.purchase_order as models
import schemas.purchase_order_schemas as schemas
from typing import List
import uuid

def generate_order_number():
    return f"PO-{uuid.uuid4().hex[:6].upper()}"

def get_purchase_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PurchaseOrder).offset(skip).limit(limit).all()

def get_purchase_order(db: Session, order_id: int):
    return db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()

def create_purchase_order(db: Session, order: schemas.PurchaseOrderCreate):
    # Calcular total
    total = sum(item.unit_cost * item.quantity_ordered for item in order.items)
    
    db_order = models.PurchaseOrder(
        order_number=generate_order_number(),
        supplier_id=order.supplier_id,
        expected_delivery=order.expected_delivery,
        notes=order.notes,
        total_amount=total,
        order_date=datetime.now(),
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Crear detalles
    for item in order.items:
        db_detail = models.PurchaseOrderDetail(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity_ordered=item.quantity_ordered,
            quantity_received=0,  # Inicialmente 0
            unit_cost=item.unit_cost,
            total_cost=item.unit_cost * item.quantity_ordered
        )
        db.add(db_detail)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def update_purchase_order(db: Session, order_id: int, order: schemas.PurchaseOrderUpdate):
    db_order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if db_order:
        update_data = order.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_order, key, value)
        
        # Si se marca como entregado, establecer fecha actual
        if order.status == "delivered" and not db_order.received_date:
            db_order.received_date = datetime.now()
        
        db.commit()
        db.refresh(db_order)
        return db_order
    return None

def delete_purchase_order(db: Session, order_id: int):
    db_order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if db_order:
        db.delete(db_order)
        db.commit()
        return True
    return False

def create_restock_order(db: Session, product_id: int, quantity: int):
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()
    if not product:
        return None, "Product not found"
    if not product.supplier_id:
        return None, "Product has no supplier assigned"
    
    order_number = f"PO-{datetime.now().strftime('%Y%m%d')}-{product_id}"
    purchase_order = models.PurchaseOrder(
        order_number=order_number,
        supplier_id=product.supplier_id,
        status="pending",
        total_amount=quantity * product.price * 0.8
    )
    db.add(purchase_order)
    db.flush()
    order_detail = models.PurchaseOrderDetail(
        purchase_order_id=purchase_order.id,
        product_id=product_id,
        quantity_ordered=quantity,
        unit_cost=product.price * 0.8,
        total_cost=quantity * product.price * 0.8
    )
    db.add(order_detail)
    db.commit()
    return purchase_order, product.name