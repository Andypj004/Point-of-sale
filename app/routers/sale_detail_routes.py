from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from crud import sale_detail_crud as crud
from schemas import sale_detail_schema as schemas
from database import Base, engine, get_db
from typing import List
from models.sale import Sale
from models.product import Product
from models.sale_detail import SaleDetail

Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/sale-details",
    tags=["sale-details"],
    responses={404: {"description": "Not found"}},
)

@router.get("/sale/{sale_id}", response_model=List[schemas.SaleDetail])
def read_sale_details(sale_id: int, db: Session = Depends(get_db)):
    return crud.get_sale_details(db, sale_id)

@router.get("/{detail_id}", response_model=schemas.SaleDetail)
def read_sale_detail(detail_id: int, db: Session = Depends(get_db)):
    db_detail = crud.get_sale_detail(db, detail_id)
    if not db_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sale detail with id {detail_id} not found"
        )
    return db_detail

@router.post("/sale/{sale_id}", response_model=schemas.SaleDetail, status_code=status.HTTP_201_CREATED)
def create_sale_detail(
    sale_id: int, 
    detail: schemas.SaleDetailCreate, 
    db: Session = Depends(get_db)
):
    return crud.create_sale_detail(db, detail, sale_id)

@router.put("/{detail_id}", response_model=schemas.SaleDetail)
def update_sale_detail(
    detail_id: int,
    detail: schemas.SaleDetailBase,
    db: Session = Depends(get_db)
):
    db_detail = crud.update_sale_detail(db, detail_id, detail)
    if not db_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sale detail with id {detail_id} not found"
        )
    return db_detail

@router.delete("/{detail_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sale_detail(detail_id: int, db: Session = Depends(get_db)):
    if not crud.delete_sale_detail(db, detail_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sale detail with id {detail_id} not found"
        )
    return {"detail": "Sale detail deleted successfully"}

@router.post("/seed", status_code=201)
def seed_sale_details(db: Session = Depends(get_db)):
    sales = db.query(Sale).limit(10).all()
    products = db.query(Product).limit(10).all()
    for i in range(10):
        detail = SaleDetail(
            sale_id=sales[i % len(sales)].id,
            product_id=products[i % len(products)].id,
            quantity=2 + i,
            unit_price=products[i % len(products)].price,
            subtotal=(2 + i) * products[i % len(products)].price
        )
        db.add(detail)
    db.commit()
    return {"message": "10 sale details seeded"}