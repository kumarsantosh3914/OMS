import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { useAppData } from '../context/AppContext';
import { useEntityList } from '../hooks/useEntityList';
import { formatCurrency, formatDate, getCustomerName } from '../utils/formatters';

function OrdersPage() {
  const { orders, customers, status, fetchOrders, fetchCustomers } = useAppData();
  const list = useEntityList(orders, ['id', 'customer_id'], 'created_at', 10);

  useEffect(() => {
    fetchOrders().catch(() => {});
    fetchCustomers().catch(() => {});
  }, [fetchCustomers, fetchOrders]);

  return (
    <>
      <PageHeader
        title="Orders"
        description="Review submitted orders and totals."
        actions={<Link className="btn btn-primary" to="/orders/new">New Order</Link>}
      />
      {(status.orders.error || status.customers.error) && (
        <div className="alert alert-error">{status.orders.error || status.customers.error}</div>
      )}
      <div className="toolbar">
        <SearchBar value={list.query} onChange={list.setQuery} placeholder="Search by order or customer ID" />
        <span>{list.filteredCount} orders</span>
      </div>
      <DataTable
        loading={status.orders.loading && !orders.length}
        rows={list.rows}
        emptyTitle="No orders found"
        emptyMessage="Create an order to start tracking fulfillment."
        columns={[
          { key: 'id', header: <button className="table-sort" onClick={() => list.changeSort('id')}>Order ID</button>, render: (row) => `#${row.id}` },
          { key: 'customer_id', header: 'Customer', render: (row) => getCustomerName(customers, row.customer_id) },
          { key: 'total_amount', header: <button className="table-sort" onClick={() => list.changeSort('total_amount')}>Total Amount</button>, render: (row) => formatCurrency(row.total_amount) },
          { key: 'created_at', header: <button className="table-sort" onClick={() => list.changeSort('created_at')}>Date</button>, render: (row) => formatDate(row.created_at) },
          { key: 'actions', header: 'Actions', render: (row) => <Link className="btn btn-secondary" to={`/orders/${row.id}`}>View Details</Link> },
        ]}
      />
      <Pagination page={list.page} totalPages={list.totalPages} onPageChange={list.setPage} />
    </>
  );
}

export default OrdersPage;
