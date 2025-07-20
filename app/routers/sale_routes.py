from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from crud import sale_crud as crud
from schemas import sale_schema as schemas
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.get("/sales", response_model=list[schemas.Sale])
def read_sales(db: Session = Depends(get_db)):
    return crud.get_sales(db)

@router.get("/sales/{sale_id}", response_model=schemas.Sale)
def read_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = crud.get_sale(db, sale_id)
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Venta con ID {sale_id} no encontrada"
        )
    return sale

@router.post('/sales', response_model=schemas.Sale)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    try:
        sale = crud.create_sale(db, sale)
        return sale
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al crear la venta: {str(e)}"
        )
        
@router.put("/sales/{sale_id}", response_model=schemas.Sale)
def update_sale(sale_id: int, sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    sale = crud.update_sale(db, sale_id, sale)
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Venta con ID {sale_id} no encontrada"
        )
    return sale