import { pool } from './config/database.js';

const res = await pool.query("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name='providers'");
console.log(JSON.stringify(res.rows, null, 2));
await pool.end();
