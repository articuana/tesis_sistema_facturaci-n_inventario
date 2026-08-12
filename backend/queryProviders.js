import { pool } from './config/database.js';

try {
  const counts = await pool.query("SELECT scheduled_day, count(*) AS total FROM providers GROUP BY scheduled_day ORDER BY scheduled_day;");
  console.log('Counts by scheduled_day:', JSON.stringify(counts.rows, null, 2));

  const missing = await pool.query("SELECT id, company, scheduled_date, scheduled_day FROM providers WHERE scheduled_day IS NULL OR scheduled_day = '' ORDER BY id LIMIT 100;");
  console.log('Missing scheduled_day rows:', JSON.stringify(missing.rows, null, 2));
} catch (error) {
  console.error(error);
} finally {
  await pool.end();
}
