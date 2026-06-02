from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


async def get_customers(db: AsyncSession) -> list[Customer]:
    """Return all customers."""
    result = await db.execute(select(Customer))
    return list(result.scalars().all())


async def get_customer(db: AsyncSession, customer_id: int) -> Customer:
    """Return a single customer or raise 404."""
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if customer is None:
        raise NotFoundException(detail=f"Customer with id {customer_id} not found")
    return customer


async def create_customer(db: AsyncSession, data: CustomerCreate) -> Customer:
    """Create a customer after validating unique email."""
    existing = await db.execute(select(Customer).where(Customer.email == data.email))
    if existing.scalar_one_or_none() is not None:
        raise ConflictException(detail=f"Customer with email '{data.email}' already exists")

    customer = Customer(**data.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer


async def delete_customer(db: AsyncSession, customer_id: int) -> None:
    """Delete a customer by id."""
    customer = await get_customer(db, customer_id)
    await db.delete(customer)
    await db.commit()
