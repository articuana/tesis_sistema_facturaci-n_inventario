import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';

const getUsers = async () => {
  const result = await pool.query(
    `SELECT id, username, first_name, last_name, name, email, identification, role, is_active, joined_at, phone, location
     FROM users
     WHERE COALESCE(is_active, true)
     ORDER BY id ASC`
  );

  return result.rows;
};

const createUser = async ({ username, firstName, lastName, email, identification, password, confirmPassword, role, phone, location, status }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedUsername = String(username).trim();
  const normalizedIdentification = String(identification).trim().toUpperCase();
  const normalizedStatus = status === 'Inactivo' ? false : true;

  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2 OR identification = $3',
    [normalizedEmail, normalizedUsername, normalizedIdentification]
  );

  if (existing.rowCount > 0) {
    throw new Error('El usuario, correo o identificación ya está registrado.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (username, first_name, last_name, name, email, identification, password_hash, role, phone, location, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, username, first_name, last_name, name, email, identification, role, is_active, joined_at, phone, location`,
    [normalizedUsername, firstName.trim(), lastName.trim(), `${firstName.trim()} ${lastName.trim()}`, normalizedEmail, normalizedIdentification, passwordHash, role, phone || null, location || null, normalizedStatus]
  );

  return result.rows[0];
};

const updateUser = async ({ id, username, firstName, lastName, email, identification, role, phone, location, status }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedUsername = String(username).trim();
  const normalizedIdentification = String(identification).trim().toUpperCase();
  const normalizedStatus = status === 'Inactivo' ? false : true;

  const existing = await pool.query(
    'SELECT id FROM users WHERE (email = $1 OR username = $2 OR identification = $3) AND id <> $4',
    [normalizedEmail, normalizedUsername, normalizedIdentification, id]
  );

  if (existing.rowCount > 0) {
    throw new Error('El usuario, correo o identificación ya está registrado por otro usuario.');
  }

  const result = await pool.query(
    `UPDATE users
     SET username = $1,
         first_name = $2,
         last_name = $3,
         name = $4,
         email = $5,
         identification = $6,
         role = $7,
         phone = $8,
         location = $9,
         is_active = $10,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $11
     RETURNING id, username, first_name, last_name, name, email, identification, role, is_active, joined_at, phone, location`,
    [normalizedUsername, firstName.trim(), lastName.trim(), `${firstName.trim()} ${lastName.trim()}`, normalizedEmail, normalizedIdentification, role, phone || null, location || null, normalizedStatus, id]
  );

  if (result.rowCount === 0) {
    throw new Error('Usuario no encontrado.');
  }

  return result.rows[0];
};

const deactivateUser = async (id) => {
  const result = await pool.query(
    `UPDATE users
     SET is_active = false,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND COALESCE(is_active, true)
     RETURNING id`,
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error('Usuario no encontrado.');
  }

  return { success: true };
};

export { getUsers, createUser, updateUser, deactivateUser };
