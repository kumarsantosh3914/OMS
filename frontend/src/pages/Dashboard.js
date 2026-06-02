import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import { useAppData } from '../context/AppContext';
import { formatCurrency, formatDate, getCustomerName } from '../utils/formatters';

function Dashboard() {
  const { products, customers, orders, status, refreshAll } = useAppData();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const lowStockProducts = products.filter((product) => Number(product.quantity_in_stock) <= 20);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const loading = status.products.loading || status.customers.loading || status.orders.loading;

  return (
    <>
      <PageHeader title="Dashboard" description="Monitor inventory health, customers, and order activity." />
      {(status.products.error || status.customers.error || status.orders.error) && (
        <div className="alert alert-error">
          {status.products.error || status.customers.error || status.orders.error}
        </div>
      )}
      <section className="stats-grid">
        <StatsCard label="Total Products" value={products.length} meta="Active SKUs" />
        <StatsCard label="Total Customers" value={customers.length} meta="Customer records" />
        <StatsCard label="Total Orders" value={orders.length} meta="Submitted orders" />
        <StatsCard label="Low Stock Products" value={lowStockProducts.length} meta="20 units or fewer" />
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Recent Orders</h2>
            <Link className="link-button" to="/orders">View all</Link>
          </div>
          <DataTable
            loading={loading && !orders.length}
            rows={recentOrders}
            emptyTitle="No orders yet"
            emptyMessage="Orders will appear here after they are created."
            columns={[
              { key: 'id', header: 'Order ID', render: (order) => `#${order.id}` },
              { key: 'customer_id', header: 'Customer', render: (order) => getCustomerName(customers, order.customer_id) },
              { key: 'total_amount', header: 'Total', render: (order) => formatCurrency(order.total_amount) },
              { key: 'created_at', header: 'Date', render: (order) => formatDate(order.created_at) },
            ]}
          />
        </div>
        <div className="panel">
          <div className="panel-header">
            <h2>Low Stock Products</h2>
            <Link className="link-button" to="/products">Manage</Link>
          </div>
          <DataTable
            loading={loading && !products.length}
            rows={lowStockProducts.slice(0, 6)}
            emptyTitle="Stock levels look healthy"
            emptyMessage="Products at or below 20 units will be listed here."
            columns={[
              { key: 'name', header: 'Product' },
              { key: 'sku', header: 'SKU' },
              { key: 'quantity_in_stock', header: 'Stock' },
            ]}
          />
        </div>
      </section>
    </>
  );
}

export default Dashboard;
