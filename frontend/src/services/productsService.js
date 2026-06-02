import { apiRequest } from './apiClient';

const productsService = {
  list: () => apiRequest('/products/'),
  get: (id) => apiRequest(`/products/${id}`),
  create: (payload) => apiRequest('/products/', { method: 'POST', body: payload }),
  update: (id, payload) => apiRequest(`/products/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
};

export default productsService;
