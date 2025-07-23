from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import models.sale as sale_models
import models.product as product_models
import models.sale_detail as sale_detail_models
import schemas.sale_schema as schemas
from datetime import datetime
from typing import List

def get_sales(db: Session, skip: int = 0, limit: int = 100):
    return db.query(sale_models.Sale).offset(skip).limit(limit).all()

def get_sale(db: Session, sale_id: int):
    return db.query(sale_models.Sale).filter(sale_models.Sale.id == sale_id).first()

def create_sale_with_details(db: Session, sale: schemas.SaleCreate):
    # Calcular total
    total = sum(item.unit_price * item.quantity for item in sale.items)
    total += sale.tax_amount - sale.discount_amount

    # Crear la venta
    db_sale = sale_models.Sale(
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
        db_detail = sale_detail_models.SaleDetail(
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
    db_sale = db.query(sale_models.Sale).filter(sale_models.Sale.id == sale_id).first()
    if db_sale:
        for key, value in sale.dict(exclude_unset=True).items():
            setattr(db_sale, key, value)
        db.commit()
        db.refresh(db_sale)
        return db_sale
    return None

def delete_sale(db: Session, sale_id: int):
    db_sale = db.query(sale_models.Sale).filter(sale_models.Sale.id == sale_id).first()
    if db_sale:
        db.delete(db_sale)
        db.commit()
        return True
    return False

def get_daily_sales_count(db: Session, today):
    return db.query(func.count(sale_models.Sale.id)).filter(
        func.date(sale_models.Sale.fecha) == today
    ).scalar() or 0

def get_daily_revenue(db: Session, today):
    return db.query(func.sum(sale_models.Sale.total)).filter(
        func.date(sale_models.Sale.fecha) == today
    ).scalar() or 0.0

def get_best_selling_products(db: Session, since_date, limit=10):
    results = db.query(
        product_models.Product.id,
        product_models.Product.name,
        product_models.Product.code,
        func.sum(sale_detail_models.SaleDetail.quantity).label('total_sold'),
        func.sum(sale_detail_models.SaleDetail.subtotal).label('total_revenue')
    ).join(
        sale_detail_models.SaleDetail, product_models.Product.id == sale_detail_models.SaleDetail.product_id
    ).join(
        sale_models.Sale, sale_detail_models.SaleDetail.sale_id == sale_models.Sale.id
    ).filter(
        sale_models.Sale.fecha >= since_date,
        product_models.Product.is_active == True
    ).group_by(
        product_models.Product.id, product_models.Product.name, product_models.Product.code
    ).order_by(
        desc('total_sold')
    ).limit(limit).all()
    return results

def get_sales_report(db: Session, start_date, end_date):
    results = db.query(
        func.date(sale_models.Sale.fecha).label('date'),
        func.count(sale_models.Sale.id).label('total_sales'),
        func.sum(sale_models.Sale.total).label('total_revenue'),
        func.sum(sale_detail_models.SaleDetail.quantity).label('total_products_sold')
    ).join(
        sale_detail_models.SaleDetail, sale_models.Sale.id == sale_detail_models.SaleDetail.sale_id
    ).filter(
        func.date(sale_models.Sale.fecha) >= start_date,
        func.date(sale_models.Sale.fecha) <= end_date
    ).group_by(
        func.date(sale_models.Sale.fecha)
    ).order_by(
        desc('date')
    ).all()
    return results