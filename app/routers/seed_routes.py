from fastapi import APIRouter, Depends
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
    # 1. Categorías reales
    categories = [
        {"name": "Lácteos", "description": "Productos derivados de la leche"},
        {"name": "Carnes", "description": "Carne de res, pollo y cerdo"},
        {"name": "Frutas", "description": "Frutas frescas de temporada"},
        {"name": "Verduras", "description": "Verduras y hortalizas frescas"},
        {"name": "Cereales", "description": "Arroz, avena y otros cereales"},
        {"name": "Bebidas", "description": "Jugos, gaseosas y aguas"},
        {"name": "Abarrotes", "description": "Aceite, azúcar, sal, fideos"},
        {"name": "Panadería", "description": "Pan, pasteles y galletas"},
        {"name": "Enlatados", "description": "Atún, sardinas y conservas"},
        {"name": "Limpieza", "description": "Detergentes y productos de aseo"}
    ]
    for cat in categories:
        if not db.query(Category).filter(Category.name == cat["name"]).first():
            db.add(Category(**cat))
    db.commit()
    categories_db = db.query(Category).all()

    # 2. Proveedores reales (genéricos)
    suppliers = [
        {"name": "Distribuidora San José", "contact_person": "María López", "phone": "555-1010",
         "email": "sanjose@proveedores.com", "address": "Av. Quito 123"},
        {"name": "AgroAlimentos Ecuador", "contact_person": "Carlos Pérez", "phone": "555-2020",
         "email": "agro@proveedores.com", "address": "Av. Amazonas 456"},
        {"name": "Frutas del Valle", "contact_person": "Ana Torres", "phone": "555-3030",
         "email": "valle@proveedores.com", "address": "Calle Guayas 789"},
        {"name": "Carnes y Más", "contact_person": "Jorge Castillo", "phone": "555-4040",
         "email": "carnesymas@proveedores.com", "address": "Av. El Inca 321"},
        {"name": "Lácteos Andinos", "contact_person": "Verónica Espinoza", "phone": "555-5050",
         "email": "andinos@proveedores.com", "address": "Panamericana Norte Km 12"},
        {"name": "Panadería El Trigo", "contact_person": "Luis Almeida", "phone": "555-6060",
         "email": "trigo@proveedores.com", "address": "Av. Colón 654"},
        {"name": "Abarrotes La Estrella", "contact_person": "Patricia Rivas", "phone": "555-7070",
         "email": "estrella@proveedores.com", "address": "Calle Esmeraldas 432"},
        {"name": "Enlatados del Pacífico", "contact_person": "Raúl Cedeño", "phone": "555-8080",
         "email": "pacifico@proveedores.com", "address": "Av. 6 de Diciembre 987"},
        {"name": "Bebidas Tropicales", "contact_person": "Gabriela Ortiz", "phone": "555-9090",
         "email": "tropicales@proveedores.com", "address": "Calle Manabí 555"},
        {"name": "Limpieza Total", "contact_person": "David Sánchez", "phone": "555-1111",
         "email": "limpieza@proveedores.com", "address": "Av. América 876"},
    ]
    for sup in suppliers:
        if not db.query(Supplier).filter(Supplier.name == sup["name"]).first():
            db.add(Supplier(**sup))
    db.commit()
    suppliers_db = db.query(Supplier).all()

    # 3. Productos reales
    products = [
        {"code": "P001", "name": "Leche entera 1L", "price": 1.20, "stock": 100, "min_stock": 10,
         "category_id": categories_db[0].id, "supplier_id": suppliers_db[4].id, "is_active": True},
        {"code": "P002", "name": "Carne de res 1kg", "price": 6.50, "stock": 50, "min_stock": 5,
         "category_id": categories_db[1].id, "supplier_id": suppliers_db[3].id, "is_active": True},
        {"code": "P003", "name": "Manzana roja 1kg", "price": 2.00, "stock": 80, "min_stock": 8,
         "category_id": categories_db[2].id, "supplier_id": suppliers_db[2].id, "is_active": True},
        {"code": "P004", "name": "Arroz 5kg", "price": 7.00, "stock": 60, "min_stock": 10,
         "category_id": categories_db[4].id, "supplier_id": suppliers_db[1].id, "is_active": True},
        {"code": "P005", "name": "Aceite vegetal 1L", "price": 3.50, "stock": 70, "min_stock": 7,
         "category_id": categories_db[6].id, "supplier_id": suppliers_db[6].id, "is_active": True},
        {"code": "P006", "name": "Pan integral 500g", "price": 1.80, "stock": 40, "min_stock": 5,
         "category_id": categories_db[7].id, "supplier_id": suppliers_db[5].id, "is_active": True},
        {"code": "P007", "name": "Atún en lata 170g", "price": 1.50, "stock": 90, "min_stock": 10,
         "category_id": categories_db[8].id, "supplier_id": suppliers_db[7].id, "is_active": True},
        {"code": "P008", "name": "Jugo natural 1L", "price": 2.50, "stock": 60, "min_stock": 6,
         "category_id": categories_db[5].id, "supplier_id": suppliers_db[8].id, "is_active": True},
        {"code": "P009", "name": "Detergente polvo 1kg", "price": 4.00, "stock": 30, "min_stock": 3,
         "category_id": categories_db[9].id, "supplier_id": suppliers_db[9].id, "is_active": True},
        {"code": "P010", "name": "Pollo entero 2kg", "price": 9.00, "stock": 35, "min_stock": 5,
         "category_id": categories_db[1].id, "supplier_id": suppliers_db[3].id, "is_active": True},
    ]
    for prod in products:
        if not db.query(Product).filter(Product.code == prod["code"]).first():
            db.add(Product(**prod))
    db.commit()
    products_db = db.query(Product).all()

    # 4. Órdenes de compra
    orders = []
    for i in range(1, 6):
        order = PurchaseOrder(
            order_number=f"PO-{i:03}",
            supplier_id=suppliers_db[i % len(suppliers_db)].id,
            status="pending",
            total_amount=100 + i * 20
        )
        db.add(order)
        orders.append(order)
    db.commit()
    orders_db = db.query(PurchaseOrder).all()

    # 5. Detalles de órdenes de compra
    for i, order in enumerate(orders_db):
        detail = PurchaseOrderDetail(
            purchase_order_id=order.id,
            product_id=products_db[i % len(products_db)].id,
            quantity_ordered=10 + i,
            unit_cost=products_db[i % len(products_db)].price * 0.8,
            total_cost=(10 + i) * products_db[i % len(products_db)].price * 0.8
        )
        db.add(detail)
    db.commit()

    # 6. Ventas
    sales = []
    for i in range(1, 6):
        sale = Sale(
            payment_method="efectivo",
            customer_name=f"Cliente {i}",
            notes=f"Venta rápida {i}",
            tax_amount=2.0,
            discount_amount=0.5,
            total=50 + i * 10,
            fecha=datetime.now()
        )
        db.add(sale)
        sales.append(sale)
    db.commit()
    sales_db = db.query(Sale).all()

    # 7. Detalles de ventas
    for i, sale in enumerate(sales_db):
        detail = SaleDetail(
            sale_id=sale.id,
            product_id=products_db[i % len(products_db)].id,
            quantity=2 + i,
            unit_price=products_db[i % len(products_db)].price,
            subtotal=(2 + i) * products_db[i % len(products_db)].price
        )
        db.add(detail)
    db.commit()

    return {"message": "Datos reales de ejemplo creados correctamente en todas las tablas."}
