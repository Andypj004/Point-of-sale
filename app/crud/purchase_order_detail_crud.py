from sqlalchemy.orm import Session
import models.purchase_order_detail as models
import schemas.purchase_order_detail_schema as schemas
from models.product import Product
import datetime

def get_order_details(db: Session, order_id: int):
    return db.query(models.PurchaseOrderDetail).filter(
        models.PurchaseOrderDetail.purchase_order_id == order_id
    ).all()

def get_order_detail(db: Session, detail_id: int):
    return db.query(models.PurchaseOrderDetail).filter(
        models.PurchaseOrderDetail.id == detail_id
    ).first()
    
def receive_order_detail_items(db: Session, detail_id: int, quantity: int):
    if quantity <= 0:
        return None, "Quantity must be positive"
    detail = db.query(models.PurchaseOrderDetail).filter(
        models.PurchaseOrderDetail.id == detail_id
    ).first()
    if not detail:
        return None, f"Order detail with id {detail_id} not found"
    detail.quantity_received += quantity
    if detail.quantity_received > detail.quantity_ordered:
        detail.quantity_received = detail.quantity_ordered
    product = db.query(Product).filter(Product.id == detail.product_id).first()
    if product:
        product.stock += quantity
        product.updated_at = datetime.now()
    db.commit()
    db.refresh(detail)
    return detail, None

def update_received_quantity(
    db: Session, 
    detail_id: int, 
    quantity_received: int
):
    db_detail = db.query(models.PurchaseOrderDetail).filter(
        models.PurchaseOrderDetail.id == detail_id
    ).first()
    if db_detail:
        db_detail.quantity_received = quantity_received
        db_detail.total_cost = db_detail.unit_cost * quantity_received
        db.commit()
        db.refresh(db_detail)
        
        # Actualizar stock del producto
        product = db.query(models.Product).filter(
            models.Product.id == db_detail.product_id
        ).first()
        if product:
            product.stock += (quantity_received - db_detail.quantity_received)
            db.commit()
        
        return db_detail
    return None