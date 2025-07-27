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
        {"code": "P001", "name": "Leche entera 1L", "price": 1.10, "stock": 100, "min_stock": 10,
         "category_id": categories_db[0].id, "supplier_id": suppliers_db[4].id, "is_active": True},  # Lácteos Andinos
        {"code": "P002", "name": "Carne de res 1kg", "price": 6.50, "stock": 50, "min_stock": 5,
         "category_id": categories_db[1].id, "supplier_id": suppliers_db[3].id, "is_active": True},  # Carnes y Más
        {"code": "P003", "name": "Manzana roja 1kg", "price": 1.00, "stock": 80, "min_stock": 8,
         "category_id": categories_db[2].id, "supplier_id": suppliers_db[2].id, "is_active": True},  # Frutas del Valle
        {"code": "P004", "name": "Arroz 5kg", "price": 7.00, "stock": 60, "min_stock": 10,
         "category_id": categories_db[4].id, "supplier_id": suppliers_db[1].id, "is_active": True},  # AgroAlimentos Ecuador
        {"code": "P005", "name": "Aceite vegetal 1L", "price": 3.30, "stock": 70, "min_stock": 7,
         "category_id": categories_db[6].id, "supplier_id": suppliers_db[6].id, "is_active": True},  # Abarrotes La Estrella
        {"code": "P006", "name": "Pan integral 500g", "price": 1.80, "stock": 40, "min_stock": 5,
         "category_id": categories_db[7].id, "supplier_id": suppliers_db[5].id, "is_active": True},  # Panadería El Trigo
        {"code": "P007", "name": "Atún en lata 350g", "price": 3.60, "stock": 90, "min_stock": 10,
         "category_id": categories_db[8].id, "supplier_id": suppliers_db[7].id, "is_active": True},  # Enlatados del Pacífico
        {"code": "P008", "name": "Jugo natural 1L", "price": 1.00, "stock": 60, "min_stock": 6,
         "category_id": categories_db[5].id, "supplier_id": suppliers_db[8].id, "is_active": True},  # Bebidas Tropicales
        {"code": "P009", "name": "Detergente polvo 1kg", "price": 1.00, "stock": 30, "min_stock": 3,
         "category_id": categories_db[9].id, "supplier_id": suppliers_db[9].id, "is_active": True},  # Limpieza Total
        {"code": "P010", "name": "Pollo entero 2kg", "price": 9.00, "stock": 35, "min_stock": 5,
         "category_id": categories_db[1].id, "supplier_id": suppliers_db[3].id, "is_active": True},  # Carnes y Más
    ]
    for prod in products:
        if not db.query(Product).filter(Product.code == prod["code"]).first():
            db.add(Product(**prod))
    db.commit()
    products_db = db.query(Product).all()

    # 4. Órdenes de compra organizadas por proveedor
    products_by_supplier = {}
    for product in products_db:
        supplier_id = product.supplier_id
        if supplier_id not in products_by_supplier:
            products_by_supplier[supplier_id] = []
        products_by_supplier[supplier_id].append(product)
    
    orders = []
    order_counter = 1
    
    # Crear una orden por cada proveedor que tenga productos
    for supplier_id, supplier_products in products_by_supplier.items():
        if supplier_products:  # Solo si el proveedor tiene productos
            order = PurchaseOrder(
                order_number=f"PO-{order_counter:03}",
                supplier_id=supplier_id,
                status="pending",
                total_amount=0  # Se calculará después
            )
            db.add(order)
            orders.append(order)
            order_counter += 1
    
    db.commit()
    orders_db = db.query(PurchaseOrder).all()

    # 5. Detalles de órdenes de compra 
    for order in orders_db:
        # Obtener productos del proveedor de esta orden
        supplier_products = [p for p in products_db if p.supplier_id == order.supplier_id]
        
        total_amount = 0
        detail_counter = 0
        
        # Crear máximo 3 detalles por orden para evitar muchos productos por orden
        for product in supplier_products[:3]:  
            quantity = 10 + detail_counter * 2  # Variar las cantidades
            unit_cost = product.price * 0.8  # 20% descuento del precio de venta
            total_cost = quantity * unit_cost
            
            detail = PurchaseOrderDetail(
                purchase_order_id=order.id,
                product_id=product.id,
                quantity_ordered=quantity,
                unit_cost=unit_cost,
                total_cost=total_cost,
                quantity_received=0  # Inicialmente no se ha recibido nada
            )
            db.add(detail)
            total_amount += total_cost
            detail_counter += 1
        
        # Actualizar el total de la orden
        order.total_amount = total_amount
    
    db.commit()

    # 6. Crear algunas órdenes adicionales 
    additional_orders = [
        {
            "supplier_id": suppliers_db[0].id,  # Distribuidora San José
            "status": "delivered",
            "products": [
                {"product_id": products_db[3].id, "quantity": 5},  # Arroz
            ]
        },
        {
            "supplier_id": suppliers_db[4].id,  # Lácteos Andinos
            "status": "in_transit", 
            "products": [
                {"product_id": products_db[0].id, "quantity": 20},  # Leche
            ]
        }
    ]
    
    for additional_order_data in additional_orders:
        total_amount = 0
        order = PurchaseOrder(
            order_number=f"PO-{order_counter:03}",
            supplier_id=additional_order_data["supplier_id"],
            status=additional_order_data["status"],
            total_amount=0
        )
        db.add(order)
        db.commit()  # Para obtener el ID
        
        for product_data in additional_order_data["products"]:
            product = db.query(Product).filter(Product.id == product_data["product_id"]).first()
            quantity = product_data["quantity"]
            unit_cost = product.price * 0.75  # Precio especial
            total_cost = quantity * unit_cost
            
            # Si la orden está entregada, marcar como recibido
            quantity_received = quantity if additional_order_data["status"] == "delivered" else 0
            
            detail = PurchaseOrderDetail(
                purchase_order_id=order.id,
                product_id=product.id,
                quantity_ordered=quantity,
                unit_cost=unit_cost,
                total_cost=total_cost,
                quantity_received=quantity_received
            )
            db.add(detail)
            total_amount += total_cost
        
        order.total_amount = total_amount
        order_counter += 1
    
    db.commit()

    # 7. Ventas
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

    # 8. Detalles de ventas
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