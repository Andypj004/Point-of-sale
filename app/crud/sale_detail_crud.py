from sqlalchemy.orm import Session
import models.sale_detail as models
import schemas.sale_detail_schema as schemas

def get_sale_details(db: Session, sale_id: int):
    return db.query(models.SaleDetail).filter(models.SaleDetail.sale_id == sale_id).all()

def get_sale_detail(db: Session, detail_id: int):
    return db.query(models.SaleDetail).filter(models.SaleDetail.id == detail_id).first()

def create_sale_detail(db: Session, detail: schemas.SaleDetailCreate, sale_id: int):
    db_detail = models.SaleDetail(
        sale_id=sale_id,
        product_id=detail.product_id,
        quantity=detail.quantity,
        unit_price=detail.unit_price,
        subtotal=detail.unit_price * detail.quantity
    )
    db.add(db_detail)
    db.commit()
    db.refresh(db_detail)
    return db_detail

def update_sale_detail(db: Session, detail_id: int, detail: schemas.SaleDetailBase):
    db_detail = db.query(models.SaleDetail).filter(models.SaleDetail.id == detail_id).first()
    if db_detail:
        for key, value in detail.dict(exclude_unset=True).items():
            setattr(db_detail, key, value)
        db_detail.subtotal = db_detail.unit_price * db_detail.quantity
        db.commit()
        db.refresh(db_detail)
        return db_detail
    return None

def delete_sale_detail(db: Session, detail_id: int):
    db_detail = db.query(models.SaleDetail).filter(models.SaleDetail.id == detail_id).first()
    if db_detail:
        db.delete(db_detail)
        db.commit()
        return True
    return False