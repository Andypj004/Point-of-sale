from sqlalchemy.orm import Session
from datetime import datetime
from models.purchase_order import PurchaseOrder
from models.purchase_order_detail import PurchaseOrderDetail
from models.product import Product
import schemas.purchase_order_schemas as schemas
from typing import List
import uuid

def generate_order_number():
    return f"PO-{uuid.uuid4().hex[:6].upper()}"

def get_purchase_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(PurchaseOrder).offset(skip).limit(limit).all()

def get_purchase_order(db: Session, order_id: int):
    return db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()

def create_purchase_order(db: Session, order: schemas.PurchaseOrderCreate):
    # Calcular total
    total = sum(item.unit_cost * item.quantity_ordered for item in order.items)
    
    db_order = PurchaseOrder(
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
        db_detail = PurchaseOrderDetail(
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
    db_order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
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
    db_order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if db_order:
        db.delete(db_order)
        db.commit()
        return True
    return False

def create_restock_order(db: Session, product_id: int, quantity: int):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()
    if not product:
        return None, "Product not found"
    if not product.supplier_id:
        return None, "Product has no supplier assigned"
    
    order_number = f"PO-{datetime.now().strftime('%Y%m%d')}-{product_id}"
    purchase_order = PurchaseOrder(
        order_number=order_number,
        supplier_id=product.supplier_id,
        status="pending",
        total_amount=quantity * product.price * 0.8
    )
    db.add(purchase_order)
    db.flush()
    order_detail = PurchaseOrderDetail(
        purchase_order_id=purchase_order.id,
        product_id=product_id,
        quantity_ordered=quantity,
        unit_cost=product.price * 0.8,
        total_cost=quantity * product.price * 0.8
    )
    db.add(order_detail)
    db.commit()
    return purchase_order, product.name

def receive_order_items(db: Session, order_id: int, items_data: dict):
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if not order:
        return None, "Order not found"
    try:
        items = items_data.get('items', [])
        for item in items:
            detail_id = item.get('detail_id')
            quantity_received = item.get('quantity_received', 0)
            if quantity_received <= 0:
                continue
            detail = db.query(PurchaseOrderDetail).filter(
                PurchaseOrderDetail.id == detail_id,
                PurchaseOrderDetail.purchase_order_id == order_id
            ).first()
            if not detail:
                continue
            detail.quantity_received += quantity_received
            if detail.quantity_received > detail.quantity_ordered:
                detail.quantity_received = detail.quantity_ordered
            product = db.query(Product).filter(Product.id == detail.product_id).first()
            if product:
                product.stock += quantity_received
                product.updated_at = datetime.now()
        all_received = all(
            detail.quantity_received >= detail.quantity_ordered
            for detail in order.purchase_order_details
        )
        if all_received:
            order.status = 'delivered'
            order.received_date = datetime.now()
        db.commit()
        db.refresh(order)
        return order, None
    except Exception as e:
        db.rollback()
        return None, f"Error receiving items: {str(e)}"

def receive_purchase_order(db: Session, order_id: int):
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if not order:
        return None, "Order not found"
    if order.status == 'delivered':
        return None, "Order already received"
    try:
        order.status = 'delivered'
        order.received_date = datetime.now()
        for detail in order.purchase_order_details:
            product = db.query(Product).filter(Product.id == detail.product_id).first()
            if product:
                detail.quantity_received = detail.quantity_ordered
                product.stock += detail.quantity_ordered
                product.updated_at = datetime.now()
        db.commit()
        db.refresh(order)
        return order, None
    except Exception as e:
        db.rollback()
        return None, f"Error receiving order: {str(e)}"