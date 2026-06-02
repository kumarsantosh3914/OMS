import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { useAppData } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import ordersService from '../services/ordersService';
import { formatCurrency, formatDate, getProductName } from '../utils/formatters';

function OrderDetailsPage() {
  const { id } = useParams();
  const { customers, products, fetchCustomers, fetchProducts } = useAppData();
  const { notify } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ordersService.get(id),
      fetchCustomers().catch(() => []),
      fetchProducts().catch(() => []),
    ])
      .then(([orderData]) => setOrder(orderData))
      .catch((error) => notify(error.message, 'error'))
      .finally(() => setLoading(false));
  }, [fetchCustomers, fetchProducts, id, notify]);

  const customer = useMemo(() => {
    if (!order) return null;
    return customers.find((item) => Number(item.id) === Number(order.customer_id));
  }, [customers, order]);

  if (loading) return <LoadingSpinner label="Loading order" />;
  if (!order) {
    return (
      <>
        <PageHeader title="Order not found" />
        <Link className="btn btn-secondary" to="/orders">Back to Orders</Link>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Order #${order.id}`}
        description={`Created ${formatDate(order.created_at)}`}
        actions={<Link className="btn btn-secondary" to="/orders">Back to Orders</Link>}
      />
      <section className="detail-grid">
        <article className="panel">
          <h2>Customer Details</h2>
          <dl className="detail-list">
            <dt>Name</dt>
            <dd>{customer?.full_name || `Customer #${order.customer_id}`}</dd>
            <dt>Email</dt>
            <dd>{customer?.email || 'Not available'}</dd>
            <dt>Phone</dt>
            <dd>{customer?.phone_number || 'Not available'}</dd>
          </dl>
        </article>
        <article className="panel">
          <h2>Order Summary</h2>
          <dl className="detail-list">
            <dt>Order ID</dt>
            <dd>#{order.id}</dd>
            <dt>Total Amount</dt>
            <dd>{formatCurrency(order.total_amount)}</dd>
            <dt>Creation Date</dt>
            <dd>{formatDate(order.created_at)}</dd>
          </dl>
        </article>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Ordered Products</h2>
          <strong>{formatCurrency(order.total_amount)}</strong>
        </div>
        <DataTable
          rows={order.items || []}
          emptyTitle="No line items returned"
          emptyMessage="The backend did not include product lines for this order."
          columns={[
            { key: 'product_id', header: 'Product', render: (row) => getProductName(products, row.product_id) },
            { key: 'quantity', header: 'Quantity' },
            { key: 'unit_price', header: 'Unit Price', render: (row) => formatCurrency(row.unit_price) },
            { key: 'subtotal', header: 'Subtotal', render: (row) => formatCurrency(row.subtotal) },
          ]}
        />
      </section>
    </>
  );
}

export default OrderDetailsPage;
