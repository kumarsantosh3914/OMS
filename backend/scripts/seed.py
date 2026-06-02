import asyncio
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import AsyncSessionLocal
from app.models.customer import Customer
from app.models.product import Product


async def seed_data() -> None:
    print("Seeding database with sample data...")

    async with AsyncSessionLocal() as session:
        # Check if we already have data
        result = await session.execute(select(Product).limit(1))
        if result.scalar_one_or_none() is not None:
            print("Database already contains products. Skipping seed.")
            return

        # 1. Create Products
        products = [
            Product(
                name="Wireless Mechanical Keyboard",
                sku="TECH-KB-001",
                price=Decimal("129.99"),
                quantity_in_stock=50,
            ),
            Product(
                name="Ergonomic Optical Mouse",
                sku="TECH-MS-002",
                price=Decimal("59.50"),
                quantity_in_stock=120,
            ),
            Product(
                name="27-inch 4K Monitor",
                sku="TECH-MN-003",
                price=Decimal("349.00"),
                quantity_in_stock=15,
            ),
            Product(
                name="USB-C Hub (7-in-1)",
                sku="TECH-HB-004",
                price=Decimal("25.99"),
                quantity_in_stock=200,
            ),
        ]
        session.add_all(products)
        print(f"Adding {len(products)} products...")

        # 2. Create Customers
        customers = [
            Customer(
                full_name="Alice Johnson",
                email="alice.johnson@example.com",
                phone_number="+1-555-0100",
            ),
            Customer(
                full_name="Bob Smith",
                email="bob.smith@example.com",
                phone_number="+1-555-0200",
            ),
            Customer(
                full_name="Charlie Davis",
                email="charlie.davis@example.com",
                phone_number="+1-555-0300",
            ),
        ]
        session.add_all(customers)
        print(f"Adding {len(customers)} customers...")

        await session.commit()
        print("✅ Seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
