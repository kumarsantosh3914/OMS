from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.customer import CustomerCreate, CustomerRead
from app.services import customer as customer_service

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
async def create_customer(
    data: CustomerCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new customer."""
    return await customer_service.create_customer(db, data)


@router.get("/", response_model=list[CustomerRead])
async def list_customers(db: AsyncSession = Depends(get_db)):
    """Return all customers."""
    return await customer_service.get_customers(db)


@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
    """Return a single customer."""
    return await customer_service.get_customer(db, customer_id)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a customer."""
    await customer_service.delete_customer(db, customer_id)
