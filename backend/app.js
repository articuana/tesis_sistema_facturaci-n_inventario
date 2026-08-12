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

const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
    process.env.ALLOWED_ORIGINS,
  ]
    .flatMap((value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean))
    .map((origin) => origin.replace(/\/$/, ''))
);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  try {
    const { hostname, origin: normalizedOrigin } = new URL(origin);
    const cleanOrigin = normalizedOrigin.replace(/\/$/, '');

    if (allowedOrigins.has(cleanOrigin)) {
      return true;
    }

    const isLocalhost = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);
    if (isLocalhost) {
      return true;
    }

    return hostname.endsWith('.vercel.app') || hostname.endsWith('.onrender.com');
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
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
