from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrderItemCreate(BaseModel):
    """Schema for an item within an order creation request."""
    product_id: int
    quantity: int = Field(..., gt=0, description="Must be greater than 0")


class OrderItemRead(BaseModel):
    """Schema for reading an order item."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float


class OrderCreate(BaseModel):
    """Schema for creating an order."""
    customer_id: int
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderRead(BaseModel):
    """Schema for reading an order."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    items: list[OrderItemRead] = []
