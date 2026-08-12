import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';
import { sanitizeUser } from '../utils/helpers.js';

const registerUser = async ({ username, firstName, lastName, email, identification, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedUsername = String(username).trim();
  const normalizedIdentification = String(identification).trim().toUpperCase();

  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2 OR identification = $3',
    [normalizedEmail, normalizedUsername, normalizedIdentification]
  );

  if (existingUser.rowCount > 0) {
    throw new Error('El usuario, correo o identificación ya está registrado en el sistema.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (username, first_name, last_name, name, email, identification, password_hash, role, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'facturador', true)
     RETURNING id, username, first_name, last_name, name, email, identification, role, is_active, joined_at, phone, location`,
    [normalizedUsername, firstName.trim(), lastName.trim(), `${firstName.trim()} ${lastName.trim()}`, normalizedEmail, normalizedIdentification, passwordHash]
  );

  return { user: sanitizeUser(result.rows[0]) };
};

const loginUser = async ({ username, password }) => {
  const result = await pool.query(
    'SELECT id, username, first_name, last_name, name, email, identification, password_hash, role, is_active, joined_at, phone, location FROM users WHERE username = $1 AND COALESCE(is_active, true)',
    [String(username).trim()]
  );

  if (result.rowCount === 0) {
    throw new Error('Credenciales incorrectas.');
  }

  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    throw new Error('Credenciales incorrectas.');
  }

  return { user: sanitizeUser(user) };
};

export { registerUser, loginUser };
