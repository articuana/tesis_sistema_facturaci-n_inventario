export const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  firstName: user.first_name,
  lastName: user.last_name,
  name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
  email: user.email,
  identification: user.identification,
  role: user.role,
  status: user.is_active ? 'Activo' : 'Inactivo',
  joinedAt: user.joined_at,
  phone: user.phone,
  location: user.location,
});

export const roundCurrency = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const getCurrentInvoiceDate = () => {
  const now = new Date();

  return now.toLocaleDateString('es-EC', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const normalizeSpaces = (value) => String(value || '').trim().replace(/\s+/g, ' ');

export const normalizeCustomerName = (value) => normalizeSpaces(value)
  .toLocaleLowerCase('es-EC')
  .replace(/(^|[ '\-])([a-záéíóúüñ])/g, (match, prefix, letter) => `${prefix}${letter.toLocaleUpperCase('es-EC')}`);

export const normalizeProductCode = (code) => {
  if (code === null || code === undefined) {
    return null;
  }

  const trimmedCode = String(code).trim();

  if (!trimmedCode || trimmedCode === 'null' || trimmedCode === 'undefined') {
    return null;
  }

  if (!/^\d{13}$/.test(trimmedCode)) {
    throw new Error('El código debe tener exactamente 13 dígitos si se proporciona.');
  }

  return trimmedCode;
};
