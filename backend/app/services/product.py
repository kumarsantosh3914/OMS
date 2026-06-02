from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def get_products(db: AsyncSession) -> list[Product]:
    """Return all products."""
    result = await db.execute(select(Product))
    return list(result.scalars().all())


async def get_product(db: AsyncSession, product_id: int) -> Product:
    """Return a single product or raise 404."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if product is None:
        raise NotFoundException(detail=f"Product with id {product_id} not found")
    return product


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    """Create a product after validating unique SKU."""
    existing = await db.execute(select(Product).where(Product.sku == data.sku))
    if existing.scalar_one_or_none() is not None:
        raise ConflictException(detail=f"Product with SKU '{data.sku}' already exists")

    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def update_product(
    db: AsyncSession, product_id: int, data: ProductUpdate
) -> Product:
    """Update product fields. Validates unique SKU if changed."""
    product = await get_product(db, product_id)
    update_data = data.model_dump(exclude_unset=True)

    if "sku" in update_data:
        existing = await db.execute(
            select(Product).where(Product.sku == update_data["sku"], Product.id != product_id)
        )
        if existing.scalar_one_or_none() is not None:
            raise ConflictException(detail=f"Product with SKU '{update_data['sku']}' already exists")

    if "quantity_in_stock" in update_data and update_data["quantity_in_stock"] < 0:
        raise BadRequestException(detail="Quantity in stock cannot be negative")

    for field, value in update_data.items():
        setattr(product, field, value)

    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product_id: int) -> None:
    """Delete a product by id."""
    product = await get_product(db, product_id)
    await db.delete(product)
    await db.commit()
