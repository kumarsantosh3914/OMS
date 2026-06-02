import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { useAppData } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import productsService from '../services/productsService';
import { validateProduct } from '../utils/validators';

const emptyProduct = { name: '', sku: '', price: '', quantity_in_stock: 0 };

function ProductFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { fetchProducts } = useAppData();
  const { notify } = useToast();
  const [values, setValues] = useState(emptyProduct);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    setLoading(true);
    productsService.get(id)
      .then((product) => setValues({
        name: product.name || '',
        sku: product.sku || '',
        price: product.price || '',
        quantity_in_stock: product.quantity_in_stock ?? 0,
      }))
      .catch((error) => notify(error.message, 'error'))
      .finally(() => setLoading(false));
  }, [id, isEditing, notify]);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateProduct(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = {
      name: values.name.trim(),
      sku: values.sku.trim(),
      price: Number(values.price),
      quantity_in_stock: Number(values.quantity_in_stock),
    };

    setSaving(true);
    try {
      if (isEditing) await productsService.update(id, payload);
      else await productsService.create(payload);
      await fetchProducts({ force: true });
      notify(`Product ${isEditing ? 'updated' : 'created'} successfully.`);
      navigate('/products');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading product" />;

  return (
    <>
      <PageHeader
        title={isEditing ? 'Edit Product' : 'New Product'}
        description="Maintain SKU, price, and stock information."
      />
      <form className="form-card" onSubmit={handleSubmit}>
        <FormInput label="Product Name" id="name" value={values.name} onChange={(event) => updateField('name', event.target.value)} error={errors.name} />
        <FormInput label="SKU" id="sku" value={values.sku} onChange={(event) => updateField('sku', event.target.value)} error={errors.sku} />
        <FormInput label="Price" id="price" type="number" step="0.01" min="0" value={values.price} onChange={(event) => updateField('price', event.target.value)} error={errors.price} />
        <FormInput label="Quantity In Stock" id="quantity_in_stock" type="number" min="0" value={values.quantity_in_stock} onChange={(event) => updateField('quantity_in_stock', event.target.value)} error={errors.quantity_in_stock} />
        <div className="form-actions">
          <Link className="btn btn-secondary" to="/products">Cancel</Link>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
        </div>
      </form>
    </>
  );
}

export default ProductFormPage;
