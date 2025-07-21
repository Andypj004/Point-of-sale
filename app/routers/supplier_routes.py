from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models.supplier as models
import schemas.supplier_schema as schemas
import crud.supplier_crud as crud
from database import get_db
from typing import List

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

@router.get("/", response_model=List[schemas.Supplier])
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_suppliers(db, skip=skip, limit=limit)

@router.get("/{supplier_id}", response_model=schemas.Supplier)
def read_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = crud.get_supplier(db, supplier_id)
    if not db_supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier with id {supplier_id} not found"
        )
    return db_supplier

@router.post("/", response_model=schemas.Supplier, status_code=status.HTTP_201_CREATED)
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    # Validar teléfono único
    existing_phone = db.query(models.Supplier).filter(
        models.Supplier.phone == supplier.phone
    ).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Validar email único (si se proporciona)
    if supplier.email:
        existing_email = db.query(models.Supplier).filter(
            models.Supplier.email == supplier.email
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    return crud.create_supplier(db, supplier)

@router.put("/{supplier_id}", response_model=schemas.Supplier)
def update_supplier(
    supplier_id: int,
    supplier: schemas.SupplierUpdate,
    db: Session = Depends(get_db)
):
    db_supplier = crud.update_supplier(db, supplier_id, supplier)
    if not db_supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier with id {supplier_id} not found"
        )
    return db_supplier

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    if not crud.delete_supplier(db, supplier_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier with id {supplier_id} not found"
        )