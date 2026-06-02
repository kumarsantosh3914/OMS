from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderRead
from app.services import order as order_service

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new order."""
    return await order_service.create_order(db, data)


@router.get("/", response_model=list[OrderRead])
async def list_orders(db: AsyncSession = Depends(get_db)):
    """Return all orders with items."""
    return await order_service.get_orders(db)


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    """Return a single order with items."""
    return await order_service.get_order(db, order_id)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    """Cancel/delete an order and restore stock."""
    await order_service.delete_order(db, order_id)
