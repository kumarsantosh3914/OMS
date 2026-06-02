from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerCreate(BaseModel):
    """Schema for creating a customer."""
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone_number: str | None = Field(None, max_length=20)


class CustomerRead(BaseModel):
    """Schema for reading a customer."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone_number: str | None
    created_at: datetime
