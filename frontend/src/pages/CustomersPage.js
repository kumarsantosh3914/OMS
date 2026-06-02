import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import { useAppData } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useEntityList } from '../hooks/useEntityList';
import customersService from '../services/customersService';
import { formatDate } from '../utils/formatters';

function CustomersPage() {
  const { customers, status, fetchCustomers } = useAppData();
  const { notify } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const searchableFields = useMemo(() => ['full_name', 'email', 'phone_number'], []);
  const list = useEntityList(customers, searchableFields, 'full_name', 10);

  useEffect(() => {
    fetchCustomers().catch(() => {});
  }, [fetchCustomers]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customersService.remove(deleteTarget.id);
      await fetchCustomers({ force: true });
      notify('Customer deleted successfully.');
      setDeleteTarget(null);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Customers"
        description="Maintain customer contact records."
        actions={<Link className="btn btn-primary" to="/customers/new">New Customer</Link>}
      />
      {status.customers.error && <div className="alert alert-error">{status.customers.error}</div>}
      <div className="toolbar">
        <SearchBar value={list.query} onChange={list.setQuery} placeholder="Search customers" />
        <span>{list.filteredCount} customers</span>
      </div>
      <DataTable
        loading={status.customers.loading && !customers.length}
        rows={list.rows}
        emptyTitle="No customers found"
        emptyMessage="Add a customer or adjust your search."
        columns={[
          { key: 'full_name', header: <button className="table-sort" onClick={() => list.changeSort('full_name')}>Full Name</button> },
          { key: 'email', header: 'Email' },
          { key: 'phone_number', header: 'Phone Number', render: (row) => row.phone_number || 'Not provided' },
          { key: 'created_at', header: 'Created', render: (row) => formatDate(row.created_at) },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => <button type="button" className="btn btn-danger" onClick={() => setDeleteTarget(row)}>Delete</button>,
          },
        ]}
      />
      {deleteTarget && (
        <ConfirmDeleteModal
          message={`Delete ${deleteTarget.full_name}? This cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </>
  );
}

export default CustomersPage;
