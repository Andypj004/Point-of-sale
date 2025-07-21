from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from crud import product_crud as crud
from schemas import product_schema as schemas
import models.product as models
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=list[schemas.Product])
def read_products(db: Session = Depends(get_db)):
    products = crud.get_products(db)
    return products

@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {product_id} no encontrado"
        )
    return product

@router.post("", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    try:
        # Validar código único
        existing_product = db.query(models.Product).filter(
            models.Product.code == product.code
        ).first()
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El código de producto ya existe"
            )
            
        return crud.create_product(db, product)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al crear producto: {str(e)}"
        )

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int, 
    product: schemas.ProductUpdate, 
    db: Session = Depends(get_db)
):
    db_product = crud.update_product(db, product_id, product)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {product_id} no encontrado"
        )
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.delete_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {product_id} no encontrado"
        )
    return {"message": f"Producto con ID {product_id} desactivado exitosamente"}