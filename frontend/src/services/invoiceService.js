import { apiRequest } from './apiClient.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const getInvoices = (role) => apiRequest('/api/invoices', {}, role);
export const saveInvoice = (payload, role) => apiRequest('/api/invoices', { method: 'POST', body: JSON.stringify(payload) }, role);
export const deleteInvoice = (id, role) => apiRequest(`/api/invoices/${id}`, { method: 'DELETE' }, role);
export const lookupCustomer = (type, identification, role) => apiRequest(`/api/customers/lookup?${new URLSearchParams({ type, identification })}`, {}, role);
export const downloadInvoicePdf = async (id, role) => {
  const response = await fetch(`${API_URL}/api/invoices/${id}/pdf`, {
    method: 'GET',
    headers: {
      'x-user-role': role,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'No se pudo descargar la factura.');
  }

  return response.blob();
};