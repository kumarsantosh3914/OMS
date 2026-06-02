import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import ProductsPage from '../pages/ProductsPage';
import ProductFormPage from '../pages/ProductFormPage';
import CustomersPage from '../pages/CustomersPage';
import CustomerFormPage from '../pages/CustomerFormPage';
import OrdersPage from '../pages/OrdersPage';
import OrderFormPage from '../pages/OrderFormPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import EmptyState from '../components/EmptyState';

function AppRoutes() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/edit/:id" element={<ProductFormPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/new" element={<CustomerFormPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/new" element={<OrderFormPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="*" element={<EmptyState title="Page not found" message="The requested page does not exist." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
