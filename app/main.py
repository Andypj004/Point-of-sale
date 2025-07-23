from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.product_routes import router as product_router
from routers.sale_routes import router as sale_router
from routers.sale_detail_routes import router as sale_detail_router 
from routers.category_routes import router as category_router
from routers.purchase_order_detail_routes import router as purchase_order_detail_router
from routers.purchase_order_routes import router as purchase_order_router
from routers.supplier_routes import router as supplier_router
from routers.dashboard_routes import router as dashboard_router
from routers.reports_routes import router as reports_router
from routers.inventory_routes import router as inventory_router
from routers.seed_routes import router as seed_router

app = FastAPI(title="POS System API", version="1.0.0")

app.include_router(product_router)
app.include_router(sale_router)
app.include_router(sale_detail_router)
app.include_router(category_router)
app.include_router(purchase_order_detail_router)
app.include_router(purchase_order_router)
app.include_router(supplier_router)
app.include_router(dashboard_router)
app.include_router(reports_router)
app.include_router(inventory_router)
app.include_router(seed_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)