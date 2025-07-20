from pydantic import BaseModel, Field

class ProductSchema(BaseModel):
    name: str = Field(..., max_length=100, description="The name of the product")
    price: float = Field(..., gt=0, description="The price of the product")
    stock: int = Field(..., ge=0, description="The available quantity of the product")

class ProductCreate(ProductSchema):
    pass

class Product(ProductSchema):
    id: int
    
    class Config:
        orm_mode = True
    