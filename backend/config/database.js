import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('DATABASE_URL existe:', !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);

    console.log('DB host:', dbUrl.hostname);
    console.log('DB port:', dbUrl.port);
    console.log('DB database:', dbUrl.pathname);
  } catch (error) {
    console.error('DATABASE_URL no tiene un formato válido');
  }
}

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:1234@localhost:5432/proyecto_tesis',

  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

export { pool };