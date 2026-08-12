import { pool } from '../config/database.js';
import { validateProviderPayload } from '../validators/providerValidator.js';

const WEEKDAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const parseWeekdaysFromRange = (dateFrom, dateTo) => {
  const days = new Set();

  const parseDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const startDate = dateFrom ? parseDate(dateFrom) : null;
  const endDate = dateTo ? parseDate(dateTo) : null;

  if (startDate && endDate) {
    const current = new Date(startDate);
    while (current <= endDate) {
      days.add(WEEKDAY_NAMES[current.getDay()]);
      current.setDate(current.getDate() + 1);
    }
  } else if (startDate) {
    days.add(WEEKDAY_NAMES[startDate.getDay()]);
  } else if (endDate) {
    days.add(WEEKDAY_NAMES[endDate.getDay()]);
  }

  return Array.from(days);
};

const getProviders = async ({ dateFrom, dateTo }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  const weekdays = parseWeekdaysFromRange(dateFrom, dateTo);
  if (weekdays.length) {
    conditions.push(`scheduled_day = ANY($${idx++})`);
    values.push(weekdays);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT id, company, supplier_name, product_type, product_type_other, scheduled_day, contact_phone, contact_mode, created_at
     FROM providers
     ${where}
     ORDER BY CASE scheduled_day
       WHEN 'Lunes' THEN 1
       WHEN 'Martes' THEN 2
       WHEN 'Miércoles' THEN 3
       WHEN 'Jueves' THEN 4
       WHEN 'Viernes' THEN 5
       WHEN 'Sábado' THEN 6
       ELSE 7 END, company ASC`,
    values
  );

  return result.rows;
};

const createProvider = async (payload) => {
  const validated = validateProviderPayload(payload);
  const {
    company, supplier_name, product_type, product_type_other, scheduled_day, contact_phone, contact_mode,
  } = validated;

  const result = await pool.query(
    `INSERT INTO providers (company, supplier_name, product_type, product_type_other, scheduled_day, contact_phone, contact_mode)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, company, supplier_name, product_type, product_type_other, scheduled_day, contact_phone, contact_mode, created_at`,
    [company.trim(), supplier_name || null, product_type, product_type_other || null, scheduled_day, contact_phone || null, contact_mode]
  );

  return result.rows[0];
};

const updateProvider = async (id, payload) => {
  const validated = validateProviderPayload(payload);
  const {
    company, supplier_name, product_type, product_type_other, scheduled_day, contact_phone, contact_mode,
  } = validated;

  const result = await pool.query(
    `UPDATE providers
     SET company = $1,
         supplier_name = $2,
         product_type = $3,
         product_type_other = $4,
         scheduled_day = $5,
         contact_phone = $6,
         contact_mode = $7,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING id, company, supplier_name, product_type, product_type_other, scheduled_day, contact_phone, contact_mode`,
    [company.trim(), supplier_name || null, product_type, product_type_other || null, scheduled_day, contact_phone || null, contact_mode, id]
  );

  if (result.rowCount === 0) {
    throw new Error('Proveedor no encontrado.');
  }

  return result.rows[0];
};

const deleteProvider = async (id) => {
  const result = await pool.query('DELETE FROM providers WHERE id = $1 RETURNING id', [id]);

  if (result.rowCount === 0) {
    throw new Error('Proveedor no encontrado.');
  }

  return { success: true };
};

export { getProviders, createProvider, updateProvider, deleteProvider };
