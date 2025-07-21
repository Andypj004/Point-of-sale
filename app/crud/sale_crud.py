from sqlalchemy.orm import Session
import models.sale as models
import schemas.sale_schema as schemas
from datetime import datetime
from typing import List

def get_sales(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Sale).offset(skip).limit(limit).all()

def get_sale(db: Session, sale_id: int):
    return db.query(models.Sale).filter(models.Sale.id == sale_id).first()

def create_sale_with_details(db: Session, sale: schemas.SaleCreate):
    # Calcular total
    total = sum(item.unit_price * item.quantity for item in sale.items)
    total += sale.tax_amount - sale.discount_amount
    
    # Crear la venta
    db_sale = models.Sale(
        payment_method=sale.payment_method,
        customer_name=sale.customer_name,
        notes=sale.notes,
        tax_amount=sale.tax_amount,
        discount_amount=sale.discount_amount,
        total=total,
        fecha=datetime.now()
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    
    # Crear detalles de venta
    for item in sale.items:
        db_detail = models.SaleDetail(
            sale_id=db_sale.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.unit_price * item.quantity
        )
        db.add(db_detail)
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

def update_sale(db: Session, sale_id: int, sale: schemas.SaleBase):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if db_sale:
        for key, value in sale.dict(exclude_unset=True).items():
            setattr(db_sale, key, value)
        db.commit()
        db.refresh(db_sale)
        return db_sale
    return None

def delete_sale(db: Session, sale_id: int):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if db_sale:
        db.delete(db_sale)
        db.commit()
        return True
    return False