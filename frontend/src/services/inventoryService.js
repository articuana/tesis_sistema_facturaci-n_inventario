import { apiRequest } from './apiClient.js';

export function getProducts(filters, role) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const query = params.toString();
  return apiRequest(`/api/products${query ? `?${query}` : ''}`, {}, role);
}
export const saveProduct = (product, role) => apiRequest(product.id ? `/api/products/${product.id}` : '/api/products', {
  method: product.id ? 'PUT' : 'POST',
  body: JSON.stringify({ name: product.name, quantity: Number(product.quantity), productType: product.productType, brand: product.brand }),
}, role);
export const deleteProduct = (id, role) => apiRequest(`/api/products/${id}`, { method: 'DELETE' }, role);
