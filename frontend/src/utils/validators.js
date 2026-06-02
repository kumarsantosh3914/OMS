export const validateProduct = (values) => {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Product name is required.';
  if (!values.sku.trim()) errors.sku = 'SKU is required.';
  if (!values.price || Number(values.price) <= 0) errors.price = 'Price must be greater than 0.';
  if (values.quantity_in_stock === '' || Number(values.quantity_in_stock) < 0) {
    errors.quantity_in_stock = 'Quantity cannot be negative.';
  }
  return errors;
};

export const validateCustomer = (values) => {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+()\-\s\d]{7,20}$/;

  if (!values.full_name.trim()) errors.full_name = 'Full name is required.';
  if (!emailPattern.test(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.phone_number.trim()) errors.phone_number = 'Phone number is required.';
  if (values.phone_number && !phonePattern.test(values.phone_number)) {
    errors.phone_number = 'Enter a valid phone number.';
  }
  return errors;
};

export const validateOrder = (values) => {
  const errors = {};
  const selectedItems = values.items.filter((item) => item.product_id);

  if (!values.customer_id) errors.customer_id = 'Customer is required.';
  if (!selectedItems.length) errors.items = 'Select at least one product.';

  selectedItems.forEach((item, index) => {
    if (!item.quantity || Number(item.quantity) <= 0) {
      errors[`quantity_${index}`] = 'Quantity must be greater than 0.';
    }
  });

  return errors;
};
