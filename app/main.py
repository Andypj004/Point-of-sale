from fastapi import FastAPI
from routers.product_routes import router as product_router
from routers.sale_routes import router as sale_router
from routers.sale_detail_routes import router as sale_detail_router 

app = FastAPI()

app.include_router(product_router)
app.include_router(sale_router)
app.include_router(sale_detail_router)