import { apiRequest } from './apiClient.js';

export const getUsers = (role) => apiRequest('/api/users', {}, role);
export const saveUser = (user, role) => apiRequest(user.id ? `/api/users/${user.id}` : '/api/users', { method: user.id ? 'PUT' : 'POST', body: JSON.stringify(user) }, role);
export const deleteUser = (id, role) => apiRequest(`/api/users/${id}`, { method: 'DELETE' }, role);
