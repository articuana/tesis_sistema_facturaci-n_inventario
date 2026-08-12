import { apiRequest } from './apiClient.js';

export function getProviders(role, dateFrom = '', dateTo = '') {
  const params = new URLSearchParams();
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);
  const query = params.toString();
  return apiRequest(`/api/providers${query ? `?${query}` : ''}`, {}, role);
}
export const saveProvider = (provider, role) => apiRequest(provider.id ? `/api/providers/${provider.id}` : '/api/providers', { method: provider.id ? 'PUT' : 'POST', body: JSON.stringify(provider) }, role);
export const deleteProvider = (id, role) => apiRequest(`/api/providers/${id}`, { method: 'DELETE' }, role);
