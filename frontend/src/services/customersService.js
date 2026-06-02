import { apiRequest } from './apiClient';

const customersService = {
  list: () => apiRequest('/customers/'),
  get: (id) => apiRequest(`/customers/${id}`),
  create: (payload) => apiRequest('/customers/', { method: 'POST', body: payload }),
  remove: (id) => apiRequest(`/customers/${id}`, { method: 'DELETE' }),
};

export default customersService;
