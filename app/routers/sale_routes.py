from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.sale import Sale
import crud.sale_crud as crud
from schemas import sale_schema as schemas
from database import Base, engine, get_db
from typing import List
from datetime import datetime

Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/sales", tags=["sales"])

@router.get("/", response_model=List[schemas.Sale])
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_sales(db, skip=skip, limit=limit)

@router.get("/{sale_id}", response_model=schemas.Sale)
def read_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = crud.get_sale(db, sale_id)
    if not db_sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sale with id {sale_id} not found"
        )
    return db_sale

@router.post("/", response_model=schemas.Sale, status_code=status.HTTP_201_CREATED)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    return crud.create_sale_with_details(db, sale)

@router.put("/{sale_id}", response_model=schemas.Sale)
def update_sale(
    sale_id: int, 
    sale: schemas.SaleBase, 
    db: Session = Depends(get_db)
):
    db_sale = crud.update_sale(db, sale_id, sale)
    if not db_sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sale with id {sale_id} not found"
        )
    return db_sale

@router.delete("/{sale_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    if not crud.delete_sale(db, sale_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sale with id {sale_id} not found"
        )
    return {"detail": "Sale deleted successfully"}

@router.post("/seed", status_code=201)
def seed_sales(db: Session = Depends(get_db)):
    sales = []
    for i in range(1, 11):
        sale = Sale(
            payment_method="cash",
            customer_name=f"Customer {i}",
            notes=f"Note {i}",
            tax_amount=2.0,
            discount_amount=1.0,
            total=100 + i,
            fecha=datetime.now()
        )
        db.add(sale)
        sales.append(sale)
    db.commit()
    return {"message": "10 sales seeded"}