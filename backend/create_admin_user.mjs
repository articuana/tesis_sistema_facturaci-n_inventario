import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/proyecto_tesis',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const admin = {
  username: 'admin2',
  email: 'admin2@tesis.local',
  firstName: 'Administrador',
  lastName: 'Prueba',
  name: 'Administrador Prueba',
  identification: '0000000001',
  password: 'Admin2026!',
  role: 'admin',
  phone: '0000000001',
  location: 'Sistema',
};

const main = async () => {
  try {
    const passwordHash = await bcrypt.hash(admin.password, 10);
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1', [admin.email, admin.username]);
    if (existing.rowCount > 0) {
      await pool.query(
        `UPDATE users
         SET username = $1,
             first_name = $2,
             last_name = $3,
             name = $4,
             identification = $5,
             password_hash = $6,
             role = $7,
             is_active = true,
             phone = $8,
             location = $9,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $10`,
        [admin.username, admin.firstName, admin.lastName, admin.name, admin.identification, passwordHash, admin.role, admin.phone, admin.location, existing.rows[0].id]
      );
      console.log('Updated existing admin id', existing.rows[0].id);
    } else {
      await pool.query(
        `INSERT INTO users (username, first_name, last_name, name, email, identification, password_hash, role, is_active, phone, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10)`,
        [admin.username, admin.firstName, admin.lastName, admin.name, admin.email, admin.identification, passwordHash, admin.role, admin.phone, admin.location]
      );
      console.log('Inserted new admin', admin.username);
    }

    const verify = await pool.query(
      'SELECT id, username, email, first_name, last_name, name, identification, role, is_active FROM users WHERE email = $1 OR username = $2',
      [admin.email, admin.username]
    );
    console.log('verify', verify.rows);
    console.log('Credentials: username=', admin.username, 'password=', admin.password);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main();
