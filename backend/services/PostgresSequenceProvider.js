import { pool } from '../config/database.js';

export class PostgresSequenceProvider {
  // Returns next sequential as 9-digit zero-padded string
  async next(estab, ptoEmi, docType) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Try to select FOR UPDATE
      const sel = await client.query(
        `SELECT val FROM sequences WHERE estab=$1 AND pto_emi=$2 AND doc_type=$3 FOR UPDATE`,
        [estab, ptoEmi, docType]
      );

      let nextVal;
      if (sel.rowCount > 0) {
        const updated = await client.query(
          `UPDATE sequences SET val = val + 1 WHERE estab=$1 AND pto_emi=$2 AND doc_type=$3 RETURNING val`,
          [estab, ptoEmi, docType]
        );
        nextVal = updated.rows[0].val;
      } else {
        const inserted = await client.query(
          `INSERT INTO sequences (estab, pto_emi, doc_type, val) VALUES ($1,$2,$3,1) RETURNING val`,
          [estab, ptoEmi, docType]
        );
        nextVal = inserted.rows[0].val;
      }

      await client.query('COMMIT');
      return nextVal.toString().padStart(9, '0');
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (e) {}
      throw err;
    } finally {
      client.release();
    }
  }

  async rollback(estab, ptoEmi, docType) {
    // Decrement last value (useful when SRI devuelve DEVUELTO)
    await pool.query(
      `UPDATE sequences SET val = GREATEST(val - 1, 0) WHERE estab=$1 AND pto_emi=$2 AND doc_type=$3`,
      [estab, ptoEmi, docType]
    );
  }
}

export default PostgresSequenceProvider;
