from sqlalchemy.orm import Session
from datetime import datetime
import models.supplier as models
import schemas.supplier_schema as schemas

def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Supplier).offset(skip).limit(limit).all()

def get_supplier(db: Session, supplier_id: int):
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    db_supplier = models.Supplier(
        name=supplier.name,
        contact_person=supplier.contact_person,
        phone=supplier.phone,
        email=supplier.email,
        address=supplier.address,
        created_at=datetime.now()
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def update_supplier(db: Session, supplier_id: int, supplier: schemas.SupplierUpdate):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier:
        update_data = supplier.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_supplier, key, value)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier
    return None

def delete_supplier(db: Session, supplier_id: int):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier:
        db.delete(db_supplier)
        db.commit()
        return True
    return False