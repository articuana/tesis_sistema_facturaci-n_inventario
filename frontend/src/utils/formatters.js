import { CUSTOMER_TYPES } from '../constants/forms.js';

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatInvoiceCustomer(invoice) {
  if (invoice.customer_type === 'consumidor_final') return invoice.customer_name || 'Consumidor Final';
  if (invoice.customer_type && invoice.customer_identification) {
    return `${invoice.customer_name || 'Cliente'} — ${CUSTOMER_TYPES[invoice.customer_type]?.label || 'Identificación'}: ${invoice.customer_identification}`;
  }
  return invoice.customer_name || 'Consumidor final';
}

export function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day + (day === 0 ? -6 : 1));
  return result;
}
