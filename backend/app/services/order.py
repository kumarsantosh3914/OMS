from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


async def get_orders(db: AsyncSession) -> list[Order]:
    """Return all orders with their items."""
    result = await db.execute(select(Order).options(selectinload(Order.items)))
    return list(result.scalars().all())


async def get_order(db: AsyncSession, order_id: int) -> Order:
    """Return a single order with items, or raise 404."""
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise NotFoundException(detail=f"Order with id {order_id} not found")
    return order


async def create_order(db: AsyncSession, data: OrderCreate) -> Order:
    """Create an order within a transaction.

    - Verifies customer and all products exist
    - Checks inventory is sufficient for every item
    - Decrements stock
    - Snapshots unit_price from the product
    - Computes subtotals and total_amount
    """
    # Verify customer
    cust_result = await db.execute(select(Customer).where(Customer.id == data.customer_id))
    if cust_result.scalar_one_or_none() is None:
        raise NotFoundException(detail=f"Customer with id {data.customer_id} not found")

    # Create order shell
    order = Order(customer_id=data.customer_id, total_amount=Decimal("0"))
    db.add(order)
    await db.flush()  # materialise order.id

    total = Decimal("0")

    for item_data in data.items:
        # Verify product
        prod_result = await db.execute(select(Product).where(Product.id == item_data.product_id))
        product = prod_result.scalar_one_or_none()
        if product is None:
            await db.rollback()
            raise NotFoundException(detail=f"Product with id {item_data.product_id} not found")

        # Check stock
        if product.quantity_in_stock < item_data.quantity:
            detail = (
                f"Insufficient stock for product '{product.name}'. "
                f"Available: {product.quantity_in_stock}, Requested: {item_data.quantity}"
            )
            await db.rollback()
            raise BadRequestException(detail=detail)

        # Decrement inventory
        product.quantity_in_stock -= item_data.quantity

        # Snapshot price and compute subtotal
        unit_price = Decimal(str(product.price))
        subtotal = unit_price * item_data.quantity

        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        )
        db.add(order_item)
        total += subtotal

    order.total_amount = total
    await db.commit()
    await db.refresh(order)

    # Reload with items eagerly loaded
    return await get_order(db, order.id)


async def delete_order(db: AsyncSession, order_id: int) -> None:
    """Delete an order and restore product stock."""
    order = await get_order(db, order_id)

    # Restore inventory
    for item in order.items:
        prod_result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = prod_result.scalar_one_or_none()
        if product is not None:
            product.quantity_in_stock += item.quantity

    await db.delete(order)
    await db.commit()
