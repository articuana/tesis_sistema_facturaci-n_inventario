const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/** Cliente HTTP centralizado para los módulos de la aplicación. */
export async function apiRequest(endpoint, options = {}, userRole) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(userRole ? { 'x-user-role': userRole } : {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const rawText = await response.text();
  let data = {};

  if (contentType.includes('application/json')) {
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = {};
    }
  }

  if (!response.ok) throw new Error(data.error || data.message || rawText || 'Ocurrió un error inesperado.');
  return data;
}
