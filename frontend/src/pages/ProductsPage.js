import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { useAppData } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useEntityList } from '../hooks/useEntityList';
import productsService from '../services/productsService';
import { formatCurrency } from '../utils/formatters';

function ProductsPage() {
  const { products, status, fetchProducts } = useAppData();
  const { notify } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const searchableFields = useMemo(() => ['name', 'sku'], []);
  const list = useEntityList(products, searchableFields, 'name');

  useEffect(() => {
    fetchProducts().catch(() => {});
  }, [fetchProducts]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productsService.remove(deleteTarget.id);
      await fetchProducts({ force: true });
      notify('Product deleted successfully.');
      setDeleteTarget(null);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'name', header: <button className="table-sort" onClick={() => list.changeSort('name')}>Product</button> },
    { key: 'sku', header: <button className="table-sort" onClick={() => list.changeSort('sku')}>SKU</button> },
    { key: 'price', header: <button className="table-sort" onClick={() => list.changeSort('price')}>Price</button>, render: (row) => formatCurrency(row.price) },
    { key: 'quantity_in_stock', header: <button className="table-sort" onClick={() => list.changeSort('quantity_in_stock')}>Stock</button> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <Link className="btn btn-secondary" to={`/products/edit/${row.id}`}>Edit</Link>
          <button type="button" className="btn btn-danger" onClick={() => setDeleteTarget(row)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description="Search, sort, and maintain product inventory."
        actions={<Link className="btn btn-primary" to="/products/new">New Product</Link>}
      />
      {status.products.error && <div className="alert alert-error">{status.products.error}</div>}
      <div className="toolbar">
        <SearchBar value={list.query} onChange={list.setQuery} placeholder="Search products or SKUs" />
        <span>{list.filteredCount} products</span>
      </div>
      <DataTable
        loading={status.products.loading && !products.length}
        rows={list.rows}
        columns={columns}
        emptyTitle="No products found"
        emptyMessage="Create a product or adjust your search."
      />
      <Pagination page={list.page} totalPages={list.totalPages} onPageChange={list.setPage} />
      {deleteTarget && (
        <ConfirmDeleteModal
          message={`Delete ${deleteTarget.name}? This cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </>
  );
}

export default ProductsPage;
