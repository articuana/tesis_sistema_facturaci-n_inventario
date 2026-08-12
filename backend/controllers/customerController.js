import { pool } from '../config/database.js';

const lookupCustomer = async (req, res) => {
  const { type, identification } = req.query;
  if (!type || !identification) {
    return res.status(400).json({ error: 'Falta tipo de cliente o identificación.' });
  }

  try {
    const result = await pool.query(
      `SELECT name, address, email, phone
       FROM customers
       WHERE identification_type = $1 AND identification = $2`,
      [type, identification.trim().toUpperCase()]
    );

    if (result.rowCount === 0) {
      return res.json({ customer: null });
    }

    return res.json({ customer: result.rows[0] });
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    return res.status(500).json({ error: 'No se pudo buscar el cliente.' });
  }
};

export { lookupCustomer };