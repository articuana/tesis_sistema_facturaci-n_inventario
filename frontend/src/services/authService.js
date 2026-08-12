import { apiRequest } from './apiClient.js';

export const login = (credentials) => apiRequest('/api/login', { method: 'POST', body: JSON.stringify(credentials) });
export const register = (payload) => apiRequest('/api/register', { method: 'POST', body: JSON.stringify(payload) });
