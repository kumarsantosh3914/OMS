<p align="center">
  <h1 align="center">OMS Backend Service</h1>
</p>

<p align="center">
  <strong>A production-ready, resilient backend for Inventory & Order Management.</strong>
</p>

---

## 📖 Overview

The **OMS (Order Management System)** backend is designed to provide high-performance, transactional integrity, and scalable inventory management. It is built strictly with modern async Python and handles complete CRUD for products, customers, and orders, while transparently managing real-time inventory deductions using isolated database transactions.

## 🚀 Key Features

- **High-Performance Async Stack:** Built with **FastAPI** and **SQLAlchemy 2.0 (asyncpg)** to handle high-throughput operations.
- **Transactional Order Processing:** Complex multi-step operations (inventory checking, stock decrements, price snapshotting, and total calculation) are guaranteed to either succeed completely or safely roll back using strict database transactions.
- **Robust Validation:** Powered by **Pydantic V2**, ensuring clean data at the boundaries (e.g., preventing negative quantities, zero pricing, or invalid email formats).
- **Data Integrity Constraints:** Database-level unique constraints on SKUs and Emails prevent race conditions.
- **Docker-Native:** First-class Docker integration featuring multi-stage builds optimized for fast caching and small image footprints.
- **Seamless Migrations:** Integrated **Alembic** setup for structured, tracked database evolution.
- **Comprehensive Test Coverage:** Backed by an extensive suite of `pytest-asyncio` tests utilizing an ephemeral SQLite backend.

---

## 🏗️ Architecture

The codebase strictly adheres to clean architecture principles:

```text
backend/
├── app/
│   ├── routers/       # HTTP controllers mapping endpoints to services
│   ├── services/      # Business logic and database operations layer
│   ├── schemas/       # Pydantic models for API validation
│   ├── models/        # SQLAlchemy ORM models mapped to PostgreSQL
│   ├── database/      # Database engines, sessions, and base classes
│   └── core/          # Configuration and global exception handlers
├── scripts/           # Utility scripts (e.g., database seeding)
├── tests/             # Automated test suite
└── alembic/           # Database migration revisions
```

---

## 🛠️ Quick Start (Docker)

The fastest way to get the API running locally is via Docker.

1. Ensure Docker and Docker Compose are installed on your machine.
2. Build and start the services:

```bash
docker compose up --build -d
```

3. **Explore the Interactive API Documentation (Swagger UI):**  
   Navigate to [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 💻 Local Development Setup

If you prefer to run the application directly on your machine without Docker:

### 1. Prerequisites
- **Python 3.12+**
- **uv** (Fast Python package installer and resolver)
- A running **PostgreSQL** instance (e.g., Neon DB or local PostgreSQL)

### 2. Installation
```bash
# Install dependencies
uv sync

# Setup environment variables
cp .env.example .env
```
*Edit your `.env` to include your valid `DATABASE_URL` (ensure it uses the `postgresql+asyncpg://` protocol).*

### 3. Database Initialization
```bash
# Run migrations to create tables
uv run alembic upgrade head

# Seed the database with sample data
uv run python scripts/seed.py
```

### 4. Running the Server
```bash
# Start the uvicorn development server
uv run uvicorn app.main:app --reload
```

---

## 🧪 Testing

The backend includes a comprehensive automated test suite testing normal flows and edge cases (insufficient stock, duplicate entities, bad parameters).

```bash
uv run pytest tests/ -v
```

---

## 🔗 API Design

The API is fully documented via OpenAPI. Key endpoints include:

### Products (`/products`)
- `GET /products` — List inventory.
- `POST /products` — Add a product (requires unique SKU).

### Customers (`/customers`)
- `GET /customers` — List customers.
- `POST /customers` — Add a customer (requires unique email).

### Orders (`/orders`)
- `POST /orders` — Create an order.
  - *Business Logic:* Automatically cross-references customer ID and product IDs, checks availability, decrements `Product.quantity_in_stock`, and computes total amounts.
- `DELETE /orders/{id}` — Cancel an order.
  - *Business Logic:* Automatically restores the decremented inventory stock.

---