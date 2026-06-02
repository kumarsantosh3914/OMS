import { apiRequest } from './apiClient';

const ordersService = {
  list: () => apiRequest('/orders/'),
  get: (id) => apiRequest(`/orders/${id}`),
  create: (payload) => apiRequest('/orders/', { method: 'POST', body: payload }),
  remove: (id) => apiRequest(`/orders/${id}`, { method: 'DELETE' }),
};

export default ordersService;
