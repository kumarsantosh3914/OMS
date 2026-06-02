export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const formatCurrency = (value) => currency.format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const getCustomerName = (customers, customerId) =>
  customers.find((customer) => Number(customer.id) === Number(customerId))?.full_name || `Customer #${customerId}`;

export const getProductName = (products, productId) =>
  products.find((product) => Number(product.id) === Number(productId))?.name || `Product #${productId}`;
