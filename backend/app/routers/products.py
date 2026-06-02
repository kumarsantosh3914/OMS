from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services import product as product_service

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new product."""
    return await product_service.create_product(db, data)


@router.get("/", response_model=list[ProductRead])
async def list_products(db: AsyncSession = Depends(get_db)):
    """Return all products."""
    return await product_service.get_products(db)


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Return a single product."""
    return await product_service.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db)
):
    """Update an existing product."""
    return await product_service.update_product(db, product_id, data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a product."""
    await product_service.delete_product(db, product_id)
