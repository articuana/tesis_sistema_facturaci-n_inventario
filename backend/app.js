import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { initializeDatabase } from './database/schema.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    try {
      const { hostname, port } = new URL(origin);
      const isLocalhost = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);

      if (isLocalhost && port) {
        callback(null, true);
        return;
      }
    } catch {
      // Ignoramos orígenes inválidos y los rechazamos por seguridad.
    }

    callback(new Error('Origen no permitido por CORS.'));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/pdf-assets', express.static(path.join(__dirname, 'public')));

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const { pool } = await import('./config/database.js');
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

const startServer = async () => {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Servidor backend iniciado en http://localhost:${PORT}`);
  });
};

export { app, startServer };
