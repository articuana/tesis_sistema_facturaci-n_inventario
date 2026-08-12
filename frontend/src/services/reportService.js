import { apiRequest } from './apiClient.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const getDashboardSummary = (role) => apiRequest('/api/reports/dashboard-summary', {}, role);
export const getReportSummary = (role) => apiRequest('/api/reports/summary', {}, role);
export const sendReport = (month, role) => apiRequest('/api/reports/send', { method: 'POST', body: JSON.stringify(month ? { month } : {}) }, role);
export const downloadReportPdf = async (month, role) => {
  const url = new URL('/api/reports/download', API_URL);
  if (month) url.searchParams.set('month', month);
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-user-role': role,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'No se pudo descargar el reporte.');
  }

  return response.blob();
};
