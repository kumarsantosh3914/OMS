import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import productsService from '../services/productsService';
import customersService from '../services/customersService';
import ordersService from '../services/ordersService';

const AppContext = createContext(null);

const initialStatus = {
  products: { loading: false, error: '' },
  customers: { loading: false, error: '' },
  orders: { loading: false, error: '' },
};

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(initialStatus);
  const [loaded, setLoaded] = useState({ products: false, customers: false, orders: false });

  const setEntityStatus = useCallback((entity, patch) => {
    setStatus((current) => ({ ...current, [entity]: { ...current[entity], ...patch } }));
  }, []);

  const fetchProducts = useCallback(async ({ force = false } = {}) => {
    if (loaded.products && !force) return products;
    setEntityStatus('products', { loading: true, error: '' });
    try {
      const data = await productsService.list();
      setProducts(Array.isArray(data) ? data : []);
      setLoaded((current) => ({ ...current, products: true }));
      return data;
    } catch (error) {
      setEntityStatus('products', { error: error.message });
      throw error;
    } finally {
      setEntityStatus('products', { loading: false });
    }
  }, [loaded.products, products, setEntityStatus]);

  const fetchCustomers = useCallback(async ({ force = false } = {}) => {
    if (loaded.customers && !force) return customers;
    setEntityStatus('customers', { loading: true, error: '' });
    try {
      const data = await customersService.list();
      setCustomers(Array.isArray(data) ? data : []);
      setLoaded((current) => ({ ...current, customers: true }));
      return data;
    } catch (error) {
      setEntityStatus('customers', { error: error.message });
      throw error;
    } finally {
      setEntityStatus('customers', { loading: false });
    }
  }, [customers, loaded.customers, setEntityStatus]);

  const fetchOrders = useCallback(async ({ force = false } = {}) => {
    if (loaded.orders && !force) return orders;
    setEntityStatus('orders', { loading: true, error: '' });
    try {
      const data = await ordersService.list();
      setOrders(Array.isArray(data) ? data : []);
      setLoaded((current) => ({ ...current, orders: true }));
      return data;
    } catch (error) {
      setEntityStatus('orders', { error: error.message });
      throw error;
    } finally {
      setEntityStatus('orders', { loading: false });
    }
  }, [loaded.orders, orders, setEntityStatus]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      fetchProducts({ force: true }),
      fetchCustomers({ force: true }),
      fetchOrders({ force: true }),
    ]);
  }, [fetchCustomers, fetchOrders, fetchProducts]);

  const value = useMemo(() => ({
    products,
    customers,
    orders,
    status,
    fetchProducts,
    fetchCustomers,
    fetchOrders,
    refreshAll,
  }), [customers, fetchCustomers, fetchOrders, fetchProducts, orders, products, refreshAll, status]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppData must be used inside AppProvider');
  return context;
}
