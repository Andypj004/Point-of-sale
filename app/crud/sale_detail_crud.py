from sqlalchemy.orm import Session
import models.sale_detail as models
import schemas.sale_detail_schema as schemas

def get_sale_details(db: Session):
    return db.query(models.SaleDetail).all()

def get_sale_detail(db: Session, sale_detail_id: int):
    return db.query(models.SaleDetail).filter(models.SaleDetail.id == sale_detail_id).first()

def create_sale_detail(db: Session, sale_detail: schemas.SaleDetailCreate):
    db_sale_detail = models.SaleDetail(**sale_detail.dict())
    db.add(db_sale_detail)
    db.commit()
    db.refresh(db_sale_detail)
    return db_sale_detail