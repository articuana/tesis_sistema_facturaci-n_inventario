import { pool } from '../config/database.js';

const ensureUserSchema = async () => {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(30)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(50)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(50)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS identification VARCHAR(20)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS ci VARCHAR(10)');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS users_username_idx ON users(username)');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS users_identification_idx ON users(identification)');
  } catch (error) {
    console.warn('No se pudo asegurar el esquema de users:', error.message);
  }
};

const ensureAdminUser = async () => {
  try {
    const adminEmail = 'admin@tesis.local';
    const adminUsername = 'admin';
    const adminFirstName = 'Administrador';
    const adminLastName = 'Sistema';
    const adminName = 'Administrador Sistema';
    const adminIdentification = '0000000000';
    const adminPhone = '0000000000';
    const adminLocation = 'Sistema';
    const adminPassword = 'admin123';
    const passwordHash = await import('bcrypt').then((m) => m.default.hash(adminPassword, 10));

    const existing = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [adminEmail]);
    if (existing.rowCount > 0) {
      await pool.query(
        `UPDATE users
         SET username = $1,
             first_name = $2,
             last_name = $3,
             name = $4,
             identification = $5,
             password_hash = $6,
             role = 'admin',
             is_active = true,
             phone = $7,
             location = $8,
             updated_at = CURRENT_TIMESTAMP
         WHERE email = $9`,
        [adminUsername, adminFirstName, adminLastName, adminName, adminIdentification, passwordHash, adminPhone, adminLocation, adminEmail]
      );
    } else {
      await pool.query(
        `INSERT INTO users (username, first_name, last_name, name, email, identification, password_hash, role, is_active, phone, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'admin', true, $8, $9)`,
        [adminUsername, adminFirstName, adminLastName, adminName, adminEmail, adminIdentification, passwordHash, adminPhone, adminLocation]
      );
    }
  } catch (error) {
    console.warn('No se pudo asegurar el usuario administrador:', error.message);
  }
};

const ensureInvoiceSchema = async () => {
  try {
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) NOT NULL DEFAULT 0');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax NUMERIC(12,2) NOT NULL DEFAULT 0');
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_type VARCHAR(30) NOT NULL DEFAULT 'consumidor_final'");
    await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_identification VARCHAR(20) NOT NULL DEFAULT '9999999999999'");
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_address VARCHAR(200)');
    await pool.query('ALTER TABLE invoices ALTER COLUMN customer_address TYPE VARCHAR(200)');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(10)');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS clave_acceso VARCHAR(64)');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS numero_autorizacion VARCHAR(64)');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS autorizacion_estado VARCHAR(30)');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recepcion_estado VARCHAR(30)');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sri_estado VARCHAR(30)');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS fecha_autorizacion TIMESTAMP WITHOUT TIME ZONE');
    await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sri_result JSONB');
    await pool.query('ALTER TABLE invoice_details ADD COLUMN IF NOT EXISTS item_name VARCHAR(180)');
    await pool.query('ALTER TABLE invoice_details ALTER COLUMN product_id DROP NOT NULL');
  } catch (error) {
    console.warn('No se pudieron asegurar las columnas de facturación:', error.message);
  }
};

const ensureProvidersSchema = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS providers (
      id SERIAL PRIMARY KEY,
      company VARCHAR(100) NOT NULL,
      supplier_name VARCHAR(100),
      product_type VARCHAR(50) NOT NULL,
      product_type_other VARCHAR(50),
      scheduled_day VARCHAR(20) NOT NULL,
      contact_phone VARCHAR(15),
      contact_mode VARCHAR(20) NOT NULL CHECK (contact_mode IN ('presencial','telefono')),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query('ALTER TABLE providers ADD COLUMN IF NOT EXISTS scheduled_day VARCHAR(20)');
    await pool.query(`DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'providers' AND column_name = 'scheduled_date'
      ) THEN
        UPDATE providers SET scheduled_day = CASE EXTRACT(DOW FROM scheduled_date)::INT
          WHEN 1 THEN 'Lunes'
          WHEN 2 THEN 'Martes'
          WHEN 3 THEN 'Miércoles'
          WHEN 4 THEN 'Jueves'
          WHEN 5 THEN 'Viernes'
          WHEN 6 THEN 'Sábado'
          WHEN 0 THEN 'Domingo'
          ELSE 'Lunes' END
          WHERE scheduled_date IS NOT NULL AND (scheduled_day IS NULL OR scheduled_day = '');
        ALTER TABLE providers DROP COLUMN scheduled_date;
      END IF;
    END $$;`);

    await pool.query('ALTER TABLE providers ALTER COLUMN scheduled_day SET NOT NULL');

    await pool.query('CREATE INDEX IF NOT EXISTS providers_scheduled_day_idx ON providers(scheduled_day)');
  } catch (error) {
    console.warn('No se pudo asegurar la tabla providers:', error.message);
  }
};

const ensureProductCodeColumnCompatibility = async () => {
  try {
    await pool.query('ALTER TABLE products ALTER COLUMN code DROP NOT NULL');
  } catch (error) {
    const message = error?.message || '';
    if (!message.toLowerCase().includes('does not exist') && !message.toLowerCase().includes('already allows null')) {
      console.warn('No se pudo ajustar la columna code de products:', message);
    }
  }
};

const ensureProductTypeColumnCompatibility = async () => {
  try {
    await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) NOT NULL DEFAULT 'Bebidas'");
  } catch (error) {
    console.warn('No se pudo asegurar la columna product_type en products:', error.message || error);
  }
};

const ensureCustomerSchema = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      identification_type VARCHAR(30) NOT NULL,
      identification VARCHAR(20) NOT NULL,
      name VARCHAR(100) NOT NULL,
      address VARCHAR(200) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(10) NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (identification_type, identification)
    )`);
  } catch (error) {
    console.warn('No se pudo asegurar la tabla de clientes:', error.message);
  }
};

const ensureSequencesSchema = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS sequences (
      id SERIAL PRIMARY KEY,
      estab VARCHAR(3) NOT NULL,
      pto_emi VARCHAR(3) NOT NULL,
      doc_type VARCHAR(30) NOT NULL,
      val BIGINT NOT NULL DEFAULT 0,
      UNIQUE(estab, pto_emi, doc_type)
    )`);

    // Seed an example row for common establecimiento/punto emission if not exists
    await pool.query(`INSERT INTO sequences (estab, pto_emi, doc_type, val)
      VALUES ('001','001','FACTURA', 0)
      ON CONFLICT (estab, pto_emi, doc_type) DO NOTHING`);
  } catch (error) {
    console.warn('No se pudo asegurar la tabla sequences:', error.message || error);
  }
};

const initializeDatabase = async () => {
  try {
    await ensureProductCodeColumnCompatibility();
    await ensureProductTypeColumnCompatibility();
    await ensureUserSchema();
    await ensureAdminUser();
    await ensureCustomerSchema();
    await ensureInvoiceSchema();
    await ensureProvidersSchema();
    await ensureSequencesSchema();
  } catch (error) {
    console.error('Error al preparar el esquema de productos:', error);
  }
};

export {
  initializeDatabase,
  ensureUserSchema,
  ensureAdminUser,
  ensureInvoiceSchema,
  ensureProvidersSchema,
  ensureProductCodeColumnCompatibility,
  ensureProductTypeColumnCompatibility,
  ensureCustomerSchema,
  ensureSequencesSchema,
};
