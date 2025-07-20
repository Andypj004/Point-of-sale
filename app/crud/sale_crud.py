from sqlalchemy.orm import Session
import models.sale as models
import schemas.sale_schema as schemas

def get_sales(db: Session):
    return db.query(models.Sale).all()

def get_sale(db: Session, sale_id: int):
    return db.query(models.Sale).filter(models.Sale.id == sale_id).first()

def create_sale(db: Session, sale: schemas.SaleCreate):
    db_sale = models.Sale(**sale.dict())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale

def update_sale(db: Session, sale_id: int, sale: schemas.SaleCreate):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if db_sale:
        for key, value in sale.dict().items():
            setattr(db_sale, key, value)
        db.commit()
        db.refresh(db_sale)
        return db_sale
    return None