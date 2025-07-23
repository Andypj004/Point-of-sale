from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import models.product as models
import models.supplier as supplier_models
import models.sale_detail as models_detail
import models.sale as sale_models
import schemas.product_schema as schemas


def get_products(db: Session):
    return db.query(models.Product).filter(models.Product.is_active == True).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        code=product.code,
        name=product.name,
        price=product.price,
        stock=product.stock,
        min_stock=product.min_stock,
        category_id=product.category_id,
        supplier_id=product.supplier_id,
        is_active=product.is_active
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product:
        update_data = product.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
        return db_product
    return None

def delete_product(db: Session, product_id: int):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product:
        db_product.is_active = False  # Soft delete
        db.commit()
        return db_product
    return None

def get_total_products(db: Session):
    return db.query(func.count(models.Product.id)).filter(
        models.Product.is_active == True
    ).scalar() or 0

def get_low_stock_count(db: Session):
    return db.query(func.count(models.Product.id)).filter(
        models.Product.stock <= models.Product.min_stock,
        models.Product.is_active == True
    ).scalar() or 0

def get_low_stock_items(db: Session):
    results = db.query(
        models.Product.id,
        models.Product.code,
        models.Product.name,
        models.Product.stock,
        models.Product.min_stock,
        supplier_models.Supplier.name.label('supplier_name')
    ).outerjoin(
        supplier_models.Supplier, models.Product.supplier_id == supplier_models.Supplier.id
    ).filter(
        models.Product.stock <= models.Product.min_stock,
        models.Product.is_active == True
    ).order_by(
        models.Product.stock.asc()
    ).all()
    return results

def get_products_report(db: Session, start_date=None, end_date=None, category_id=None):
    query = db.query(
        models.Product.id,
        models.Product.name,
        models.Product.code,
        models.Product.stock,
        func.coalesce(func.sum(models_detail.SaleDetail.quantity), 0).label('total_sold'),
        func.coalesce(func.sum(models_detail.SaleDetail.subtotal), 0).label('total_revenue')
    ).outerjoin(
        models_detail.SaleDetail, models.Product.id == models_detail.SaleDetail.product_id
    ).outerjoin(
        sale_models.Sale, models_detail.SaleDetail.sale_id == sale_models.Sale.id
    ).filter(
        models.Product.is_active == True
    )
    if start_date and end_date:
        query = query.filter(
            func.date(sale_models.Sale.fecha) >= start_date,
            func.date(sale_models.Sale.fecha) <= end_date
        )
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    results = query.group_by(
        models.Product.id, models.Product.name, models.Product.code, models.Product.stock
    ).order_by(
        desc('total_sold')
    ).all()
    return results