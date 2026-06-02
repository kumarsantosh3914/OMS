import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { useAppData } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import ordersService from '../services/ordersService';
import { formatCurrency } from '../utils/formatters';
import { validateOrder } from '../utils/validators';

const emptyItem = { product_id: '', quantity: 1 };

function OrderFormPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { products, customers, status, fetchProducts, fetchCustomers, fetchOrders } = useAppData();
  const [values, setValues] = useState({ customer_id: '', items: [{ ...emptyItem }] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts().catch(() => {});
    fetchCustomers().catch(() => {});
  }, [fetchCustomers, fetchProducts]);

  const productMap = useMemo(() => {
    return products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});
  }, [products]);

  const lineItems = values.items.map((item) => {
    const product = productMap[item.product_id];
    const quantity = Number(item.quantity || 0);
    return {
      ...item,
      product,
      subtotal: product ? Number(product.price) * quantity : 0,
    };
  });
  const total = lineItems.reduce((sum, item) => sum + item.subtotal, 0);

  const updateItem = (index, field, value) => {
    setValues((current) => {
      const items = current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      );
      return { ...current, items };
    });
    setErrors((current) => ({ ...current, items: '', [`quantity_${index}`]: '' }));
  };

  const addItem = () => {
    setValues((current) => ({ ...current, items: [...current.items, { ...emptyItem }] }));
  };

  const removeItem = (index) => {
    setValues((current) => ({
      ...current,
      items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateOrder(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = {
      customer_id: Number(values.customer_id),
      items: values.items
        .filter((item) => item.product_id)
        .map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),
    };

    setSaving(true);
    try {
      await ordersService.create(payload);
      await Promise.all([fetchOrders({ force: true }), fetchProducts({ force: true })]);
      notify('Order created successfully.');
      navigate('/orders');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const loading = (status.products.loading && !products.length) || (status.customers.loading && !customers.length);
  if (loading) return <LoadingSpinner label="Loading order data" />;

  return (
    <>
      <PageHeader title="New Order" description="Select a customer and one or more products." />
      {(status.products.error || status.customers.error) && (
        <div className="alert alert-error">{status.products.error || status.customers.error}</div>
      )}
      <form className="form-card wide" onSubmit={handleSubmit}>
        <FormSelect
          label="Customer"
          id="customer_id"
          value={values.customer_id}
          onChange={(event) => {
            setValues((current) => ({ ...current, customer_id: event.target.value }));
            setErrors((current) => ({ ...current, customer_id: '' }));
          }}
          error={errors.customer_id}
        >
          <option value="">Select customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.full_name}</option>
          ))}
        </FormSelect>

        <div className="order-lines">
          <div className="section-title">
            <h2>Products</h2>
            <button type="button" className="btn btn-secondary" onClick={addItem}>Add Product</button>
          </div>
          {errors.items && <div className="field-error">{errors.items}</div>}
          {values.items.map((item, index) => (
            <div className="order-line" key={`${index}-${item.product_id}`}>
              <FormSelect
                label="Product"
                id={`product_${index}`}
                value={item.product_id}
                onChange={(event) => updateItem(index, 'product_id', event.target.value)}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.price)} ({product.quantity_in_stock} in stock)
                  </option>
                ))}
              </FormSelect>
              <FormInput
                label="Quantity"
                id={`quantity_${index}`}
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                error={errors[`quantity_${index}`]}
              />
              <div className="line-total">
                <span>Subtotal</span>
                <strong>{formatCurrency(lineItems[index].subtotal)}</strong>
              </div>
              <button type="button" className="btn btn-danger" onClick={() => removeItem(index)} disabled={values.items.length === 1}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="total-box">
          <span>Estimated Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>

        <div className="form-actions">
          <Link className="btn btn-secondary" to="/orders">Cancel</Link>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit Order'}</button>
        </div>
      </form>
    </>
  );
}

export default OrderFormPage;
