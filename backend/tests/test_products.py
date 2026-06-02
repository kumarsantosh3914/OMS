from httpx import AsyncClient


async def test_create_product(client: AsyncClient):
    """POST /products/ — create a product."""
    response = await client.post("/products/", json={
        "name": "Widget",
        "sku": "WDG-001",
        "price": 9.99,
        "quantity_in_stock": 100,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Widget"
    assert data["sku"] == "WDG-001"
    assert data["price"] == 9.99
    assert data["quantity_in_stock"] == 100


async def test_create_product_duplicate_sku(client: AsyncClient):
    """Duplicate SKU returns 409."""
    payload = {"name": "A", "sku": "DUP-001", "price": 1.0}
    await client.post("/products/", json=payload)
    resp = await client.post("/products/", json=payload)
    assert resp.status_code == 409


async def test_create_product_negative_quantity(client: AsyncClient):
    """Negative quantity is rejected (422 from Pydantic)."""
    resp = await client.post("/products/", json={
        "name": "Bad", "sku": "BAD-001", "price": 1.0, "quantity_in_stock": -5,
    })
    assert resp.status_code == 422


async def test_create_product_zero_price(client: AsyncClient):
    """Price must be > 0."""
    resp = await client.post("/products/", json={
        "name": "Free", "sku": "FREE-001", "price": 0,
    })
    assert resp.status_code == 422


async def test_list_products(client: AsyncClient):
    """GET /products/ — returns list."""
    await client.post("/products/", json={"name": "A", "sku": "A-1", "price": 1.0})
    await client.post("/products/", json={"name": "B", "sku": "B-1", "price": 2.0})
    resp = await client.get("/products/")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


async def test_get_product(client: AsyncClient):
    """GET /products/{id} — single product."""
    create = await client.post("/products/", json={"name": "X", "sku": "X-1", "price": 5.0})
    pid = create.json()["id"]
    resp = await client.get(f"/products/{pid}")
    assert resp.status_code == 200
    assert resp.json()["sku"] == "X-1"


async def test_get_product_not_found(client: AsyncClient):
    """404 for non-existent product."""
    resp = await client.get("/products/9999")
    assert resp.status_code == 404


async def test_update_product(client: AsyncClient):
    """PUT /products/{id} — update."""
    create = await client.post("/products/", json={"name": "Old", "sku": "U-1", "price": 1.0})
    pid = create.json()["id"]
    resp = await client.put(f"/products/{pid}", json={"name": "New", "price": 2.5})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New"
    assert resp.json()["price"] == 2.5


async def test_delete_product(client: AsyncClient):
    """DELETE /products/{id} — 204."""
    create = await client.post("/products/", json={"name": "Del", "sku": "D-1", "price": 1.0})
    pid = create.json()["id"]
    resp = await client.delete(f"/products/{pid}")
    assert resp.status_code == 204
    assert (await client.get(f"/products/{pid}")).status_code == 404
