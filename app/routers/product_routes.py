from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from crud import product_crud as crud
from schemas import product_schema as schemas
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.get("/products", response_model=list[schemas.Product])
def read_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

@router.get("/products/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {product_id} no encontrado"
        )
    return product

@router.post('/products', response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    try:
        product = crud.create_product(db, product)
        return product
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al crear el producto: {str(e)}"
        )

@router.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db)):
    product = crud.update_product(db, product_id, product)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {product_id} no encontrado"
        )
    return product

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.delete_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {product_id} no encontrado"
        )
    return {"message": f"Producto con ID {product_id} eliminado exitosamente"}