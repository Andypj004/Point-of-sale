from sqlalchemy.orm import Session
from datetime import datetime
from models.purchase_order import PurchaseOrder
from models.purchase_order_detail import PurchaseOrderDetail
from models.product import Product
import schemas.purchase_order_schemas as schemas
from typing import List
import random
import uuid

def generate_order_number(db: Session, prefix: str = "PO"):
    """Genera un número de orden único"""
    max_attempts = 10
    for attempt in range(max_attempts):
        # Formato: PO-YYYYMMDD-HHMMSS-RRR
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        random_suffix = random.randint(100, 999)
        order_number = f"{prefix}-{timestamp}-{random_suffix}"
        
        # Verificar si ya existe
        existing = db.query(PurchaseOrder).filter(
            PurchaseOrder.order_number == order_number
        ).first()
        
        if not existing:
            return order_number
    
    # Si después de 10 intentos no encuentra uno único, usar timestamp más específico
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S-%f')[:-3]  # microsegundos truncados
    return f"{prefix}-{timestamp}"

def get_purchase_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(PurchaseOrder).offset(skip).limit(limit).all()

def get_purchase_order(db: Session, order_id: int):
    return db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()

def create_purchase_order(db: Session, order: schemas.PurchaseOrderCreate):
    # Calcular total
    total = sum(item.unit_cost * item.quantity_ordered for item in order.items)
    order_number = generate_order_number(db, "PO")
    
    db_order = PurchaseOrder(
        order_number=order_number,
        supplier_id=order.supplier_id,
        expected_delivery=order.expected_delivery,
        notes=order.notes,
        total_amount=total,
        order_date=datetime.now(),
        status="pending"
    )
    db.add(db_order)
    
    try:
        db.flush()  # Para obtener el ID
        
        # Crear detalles
        for item in order.items:
            db_detail = PurchaseOrderDetail(
                purchase_order_id=db_order.id,
                product_id=item.product_id,
                quantity_ordered=item.quantity_ordered,
                quantity_received=0,
                unit_cost=item.unit_cost,
                total_cost=item.unit_cost * item.quantity_ordered
            )
            db.add(db_detail)
        
        db.commit()
        db.refresh(db_order)
        return db_order
        
    except Exception as e:
        db.rollback()
        raise e

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
    
    # Generar número de orden único
    order_number = generate_order_number(db, "RST")  # RST = Restock
    
    total_cost = quantity * product.price * 0.8
    
    purchase_order = PurchaseOrder(
        order_number=order_number,
        supplier_id=product.supplier_id,
        status="pending",
        total_amount=total_cost,
        order_date=datetime.now(),
        notes=f"Restock order for {product.name}"
    )
    db.add(purchase_order)
    db.flush()  # Para obtener el ID sin commit completo
    
    order_detail = PurchaseOrderDetail(
        purchase_order_id=purchase_order.id,
        product_id=product_id,
        quantity_ordered=quantity,
        quantity_received=0,
        unit_cost=product.price * 0.8,
        total_cost=total_cost
    )
    db.add(order_detail)
    
    try:
        db.commit()
        return purchase_order, product.name
    except Exception as e:
        db.rollback()
        return None, f"Error creating restock order: {str(e)}"

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