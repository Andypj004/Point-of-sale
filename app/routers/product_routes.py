from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from crud import product_crud as crud
from schemas import product_schema as schemas
from database import Base, engine, get_db

# Importa los modelos explícitamente
from models.product import Product
from models.category import Category
from models.supplier import Supplier

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
        existing_product = db.query(Product).filter(
            Product.code == product.code
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

@router.post("/seed", status_code=201)
def seed_products(db: Session = Depends(get_db)):
    categories = db.query(Category).limit(10).all()
    suppliers = db.query(Supplier).limit(10).all()
    if not categories or not suppliers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se requieren al menos una categoría y un proveedor para crear productos. Primero ejecuta /categories/seed y /suppliers/seed."
        )
    products = [
        {
            "code": f"P{i:03}",
            "name": f"Product {i}",
            "price": 10.0 + i,
            "stock": 50 + i,
            "min_stock": 10,
            "category_id": categories[i % len(categories)].id,
            "supplier_id": suppliers[i % len(suppliers)].id,
            "is_active": True
        } for i in range(1, 11)
    ]
    for prod in products:
        if not db.query(Product).filter(Product.code == prod["code"]).first():
            db.add(Product(**prod))
    db.commit()
    return {"message": "10 products seeded"}