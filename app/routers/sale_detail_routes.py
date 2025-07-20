from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from crud import sale_detail_crud as crud
from schemas import sale_detail_schema as schemas
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.get("/saledetail", response_model=list[schemas.SaleDetail])
def read_sales(db: Session = Depends(get_db)):
    return crud.get_sale_details(db)

@router.get("/saledetail/{sale_id}", response_model=schemas.SaleDetail)
def read_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = crud.get_sale_detail(db, sale_id)
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Detalle de venta con ID {sale_id} no encontrada"
        )
    return sale

@router.post('/saledetail', response_model=schemas.SaleDetail)
def create_sale(sale: schemas.SaleDetailCreate, db: Session = Depends(get_db)):
    try:
        sale = crud.create_sale_detail(db, sale)
        return sale
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al crear el detalle de venta: {str(e)}"
        )