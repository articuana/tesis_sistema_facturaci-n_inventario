import { pool } from '../config/database.js';
import { normalizeProductCode } from '../utils/helpers.js';
import { validateProductPayload } from '../validators/productValidator.js';

const getProducts = async ({ name = '', dateFrom = '', dateTo = '', quantity = '' }) => {
  const conditions = [];
  const values = [];
  let index = 1;

  if (name) {
    conditions.push(`LOWER(name) LIKE LOWER($${index++})`);
    values.push(`%${name}%`);
  }

  if (dateFrom) {
    conditions.push(`created_at::date >= $${index++}`);
    values.push(dateFrom);
  }

  if (dateTo) {
    conditions.push(`created_at::date <= $${index++}`);
    values.push(dateTo);
  }

  if (quantity) {
    conditions.push(`quantity >= $${index++}`);
    values.push(Number(quantity));
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT id, name, quantity, code, brand, product_type, created_at, updated_at
     FROM products
     ${whereClause}
     ORDER BY created_at DESC`,
    values
  );

  return result.rows.map((product) => ({
    ...product,
    code: normalizeProductCode(product.code),
    productType: product.product_type || 'Bebidas',
  }));
};

const createProduct = async ({ name, quantity, code, productType, brand }) => {
  validateProductPayload({ name, quantity, code, productType, brand });
  const normalizedCode = normalizeProductCode(code);

  const result = await pool.query(
    `INSERT INTO products (name, quantity, code, product_type, brand)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, quantity, code, product_type, brand, created_at, updated_at`,
    [name.trim(), Number(quantity), normalizedCode, productType, brand?.trim() || null]
  );

  return result.rows[0];
};

const updateProduct = async ({ id, name, quantity, code, productType, brand }) => {
  validateProductPayload({ name, quantity, code, productType, brand });
  const normalizedCode = normalizeProductCode(code);

  const result = await pool.query(
    `UPDATE products
     SET name = $1,
         quantity = $2,
         code = $3,
         product_type = $4,
         brand = $5,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING id, name, quantity, code, product_type, brand, created_at, updated_at`,
    [name.trim(), Number(quantity), normalizedCode, productType, brand?.trim() || null, id]
  );

  if (result.rowCount === 0) {
    throw new Error('Producto no encontrado.');
  }

  return result.rows[0];
};

const deleteProduct = async (id) => {
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

  if (result.rowCount === 0) {
    throw new Error('Producto no encontrado.');
  }

  return { success: true };
};

export { getProducts, createProduct, updateProduct, deleteProduct };
