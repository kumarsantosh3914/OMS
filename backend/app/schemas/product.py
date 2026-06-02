from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    """Schema for creating a product."""
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0, description="Must be greater than 0")
    quantity_in_stock: int = Field(default=0, ge=0, description="Must be >= 0")


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    name: str | None = Field(None, min_length=1, max_length=255)
    sku: str | None = Field(None, min_length=1, max_length=100)
    price: float | None = Field(None, gt=0)
    quantity_in_stock: int | None = Field(None, ge=0)


class ProductRead(BaseModel):
    """Schema for reading a product."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    price: float
    quantity_in_stock: int
    created_at: datetime
    updated_at: datetime
