from httpx import AsyncClient


async def _create_product(client: AsyncClient, name: str, sku: str, price: float, qty: int) -> int:
    resp = await client.post("/products/", json={
        "name": name, "sku": sku, "price": price, "quantity_in_stock": qty,
    })
    return resp.json()["id"]


async def _create_customer(client: AsyncClient, name: str, email: str) -> int:
    resp = await client.post("/customers/", json={"full_name": name, "email": email})
    return resp.json()["id"]


async def test_create_order(client: AsyncClient):
    """Successful order creation."""
    pid = await _create_product(client, "Gadget", "GAD-001", 25.0, 10)
    cid = await _create_customer(client, "Alice", "alice@test.com")

    resp = await client.post("/orders/", json={
        "customer_id": cid,
        "items": [{"product_id": pid, "quantity": 3}],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["customer_id"] == cid
    assert data["total_amount"] == 75.0
    assert len(data["items"]) == 1
    assert data["items"][0]["unit_price"] == 25.0
    assert data["items"][0]["subtotal"] == 75.0

    # Stock should be decremented
    product = await client.get(f"/products/{pid}")
    assert product.json()["quantity_in_stock"] == 7


async def test_create_order_insufficient_stock(client: AsyncClient):
    """Order rejected when stock is insufficient."""
    pid = await _create_product(client, "Scarce", "SCR-001", 10.0, 2)
    cid = await _create_customer(client, "Bob", "bob@test.com")

    resp = await client.post("/orders/", json={
        "customer_id": cid,
        "items": [{"product_id": pid, "quantity": 5}],
    })
    assert resp.status_code == 400
    assert "Insufficient stock" in resp.json()["detail"]

    # Stock should NOT be decremented
    product = await client.get(f"/products/{pid}")
    assert product.json()["quantity_in_stock"] == 2


async def test_create_order_customer_not_found(client: AsyncClient):
    pid = await _create_product(client, "P", "P-001", 1.0, 10)
    resp = await client.post("/orders/", json={
        "customer_id": 9999,
        "items": [{"product_id": pid, "quantity": 1}],
    })
    assert resp.status_code == 404


async def test_create_order_product_not_found(client: AsyncClient):
    cid = await _create_customer(client, "C", "c@test.com")
    resp = await client.post("/orders/", json={
        "customer_id": cid,
        "items": [{"product_id": 9999, "quantity": 1}],
    })
    assert resp.status_code == 404


async def test_create_order_empty_items(client: AsyncClient):
    """Order with no items is rejected (422 from Pydantic)."""
    cid = await _create_customer(client, "Empty", "empty@test.com")
    resp = await client.post("/orders/", json={
        "customer_id": cid, "items": [],
    })
    assert resp.status_code == 422


async def test_list_orders(client: AsyncClient):
    pid = await _create_product(client, "LP", "LP-001", 5.0, 50)
    cid = await _create_customer(client, "List", "list@test.com")
    await client.post("/orders/", json={"customer_id": cid, "items": [{"product_id": pid, "quantity": 1}]})
    await client.post("/orders/", json={"customer_id": cid, "items": [{"product_id": pid, "quantity": 2}]})
    resp = await client.get("/orders/")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


async def test_get_order(client: AsyncClient):
    pid = await _create_product(client, "GO", "GO-001", 10.0, 20)
    cid = await _create_customer(client, "Get", "get@test.com")
    create = await client.post("/orders/", json={
        "customer_id": cid, "items": [{"product_id": pid, "quantity": 2}],
    })
    oid = create.json()["id"]
    resp = await client.get(f"/orders/{oid}")
    assert resp.status_code == 200
    assert resp.json()["total_amount"] == 20.0
    assert len(resp.json()["items"]) == 1


async def test_get_order_not_found(client: AsyncClient):
    resp = await client.get("/orders/9999")
    assert resp.status_code == 404


async def test_delete_order_restores_stock(client: AsyncClient):
    """Deleting an order restores product stock."""
    pid = await _create_product(client, "Restore", "RST-001", 15.0, 10)
    cid = await _create_customer(client, "Del", "del@test.com")

    create = await client.post("/orders/", json={
        "customer_id": cid, "items": [{"product_id": pid, "quantity": 4}],
    })
    oid = create.json()["id"]

    # Stock should be 6 after order
    product = await client.get(f"/products/{pid}")
    assert product.json()["quantity_in_stock"] == 6

    # Delete order
    resp = await client.delete(f"/orders/{oid}")
    assert resp.status_code == 204

    # Stock should be restored to 10
    product = await client.get(f"/products/{pid}")
    assert product.json()["quantity_in_stock"] == 10
