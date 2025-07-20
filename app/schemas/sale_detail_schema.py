from pydantic import BaseModel, Field

class SaleDetailSchema(BaseModel):
    sale_id: int = Field(..., description="ID de la venta a la que pertenece el detalle", example=1)
    product_id: int = Field(..., description="ID del producto vendido", example=1)
    quantity: int = Field(..., gt=0, description="Cantidad del producto vendido", example=2)
    subtotal: float = Field(..., gt=0, description="Subtotal de la venta del producto", example=19.99)
    
class SaleDetailCreate(SaleDetailSchema):
    pass

class SaleDetail(SaleDetailSchema):
    id: int
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "sale_id": 1,
                "product_id": 1,
                "quantity": 2,
                "subtotal": 19.99
            }
        }