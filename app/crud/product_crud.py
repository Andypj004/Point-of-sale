from sqlalchemy.orm import Session
import models.product as models
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