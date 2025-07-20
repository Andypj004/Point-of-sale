from pydantic import BaseModel, Field
from datetime import date

class SaleSchema(BaseModel):
    fecha : date = Field(..., description="Fecha de la venta en formato ISO 8601", example="2023-10-01")
    total : float = Field(..., gt=0, description="Total de la venta", example=99.99)
    
class SaleCreate(SaleSchema):
    pass

class Sale(SaleSchema):
    id: int
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "fecha": "2023-10-01",
                "total": 99.99
            }
        }