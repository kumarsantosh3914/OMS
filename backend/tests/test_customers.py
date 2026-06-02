from httpx import AsyncClient


async def test_create_customer(client: AsyncClient):
    resp = await client.post("/customers/", json={
        "full_name": "Jane Doe",
        "email": "jane@example.com",
        "phone_number": "+1234567890",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["full_name"] == "Jane Doe"
    assert data["email"] == "jane@example.com"


async def test_create_customer_duplicate_email(client: AsyncClient):
    payload = {"full_name": "A", "email": "dupe@example.com"}
    await client.post("/customers/", json=payload)
    resp = await client.post("/customers/", json=payload)
    assert resp.status_code == 409


async def test_list_customers(client: AsyncClient):
    await client.post("/customers/", json={"full_name": "A", "email": "a@test.com"})
    await client.post("/customers/", json={"full_name": "B", "email": "b@test.com"})
    resp = await client.get("/customers/")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


async def test_get_customer(client: AsyncClient):
    create = await client.post("/customers/", json={"full_name": "C", "email": "c@test.com"})
    cid = create.json()["id"]
    resp = await client.get(f"/customers/{cid}")
    assert resp.status_code == 200
    assert resp.json()["email"] == "c@test.com"


async def test_get_customer_not_found(client: AsyncClient):
    resp = await client.get("/customers/9999")
    assert resp.status_code == 404


async def test_delete_customer(client: AsyncClient):
    create = await client.post("/customers/", json={"full_name": "D", "email": "d@test.com"})
    cid = create.json()["id"]
    resp = await client.delete(f"/customers/{cid}")
    assert resp.status_code == 204
    assert (await client.get(f"/customers/{cid}")).status_code == 404
