from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.category import Category
from models.supplier import Supplier
from models.product import Product
from models.purchase_order import PurchaseOrder
from models.purchase_order_detail import PurchaseOrderDetail
from models.sale import Sale
from models.sale_detail import SaleDetail
from database import get_db
from datetime import datetime

router = APIRouter(prefix="/seed", tags=["seed"])

@router.post("/all", status_code=201)
def seed_all(db: Session = Depends(get_db)):
    # 1. Categories
    categories = [
        {"name": f"Category {i}", "description": f"Description {i}"} for i in range(1, 11)
    ]
    for cat in categories:
        if not db.query(Category).filter(Category.name == cat["name"]).first():
            db.add(Category(**cat))
    db.commit()
    categories_db = db.query(Category).limit(10).all()

    # 2. Suppliers
    suppliers = [
        {
            "name": f"Supplier {i}",
            "contact_person": f"Contact {i}",
            "phone": f"555-000{i}",
            "email": f"supplier{i}@mail.com",
            "address": f"Address {i}"
        } for i in range(1, 11)
    ]
    for sup in suppliers:
        if not db.query(Supplier).filter(Supplier.name == sup["name"]).first():
            db.add(Supplier(**sup))
    db.commit()
    suppliers_db = db.query(Supplier).limit(10).all()

    # 3. Products
    products = [
        {
            "code": f"P{i:03}",
            "name": f"Product {i}",
            "price": 10.0 + i,
            "stock": 50 + i,
            "min_stock": 10,
            "category_id": categories_db[i % len(categories_db)].id,
            "supplier_id": suppliers_db[i % len(suppliers_db)].id,
            "is_active": True
        } for i in range(1, 11)
    ]
    for prod in products:
        if not db.query(Product).filter(Product.code == prod["code"]).first():
            db.add(Product(**prod))
    db.commit()
    products_db = db.query(Product).limit(10).all()

    # 4. Purchase Orders
    orders = []
    for i in range(1, 11):
        order = PurchaseOrder(
            order_number=f"PO-{i:03}",
            supplier_id=suppliers_db[i % len(suppliers_db)].id,
            status="pending",
            total_amount=100 + i
        )
        db.add(order)
        orders.append(order)
    db.commit()
    orders_db = db.query(PurchaseOrder).limit(10).all()

    # 5. Purchase Order Details
    for i in range(10):
        detail = PurchaseOrderDetail(
            purchase_order_id=orders_db[i % len(orders_db)].id,
            product_id=products_db[i % len(products_db)].id,
            quantity_ordered=5 + i,
            unit_cost=products_db[i % len(products_db)].price * 0.8,
            total_cost=(5 + i) * products_db[i % len(products_db)].price * 0.8
        )
        db.add(detail)
    db.commit()

    # 6. Sales
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
    sales_db = db.query(Sale).limit(10).all()

    # 7. Sale Details
    for i in range(10):
        detail = SaleDetail(
            sale_id=sales_db[i % len(sales_db)].id,
            product_id=products_db[i % len(products_db)].id,
            quantity=2 + i,
            unit_price=products_db[i % len(products_db)].price,
            subtotal=(2 + i) * products_db[i % len(products_db)].price
        )
        db.add(detail)
    db.commit()

    return {"message": "Datos de ejemplo creados correctamente en todas las tablas."}