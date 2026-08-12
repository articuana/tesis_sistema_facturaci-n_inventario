-- Archivo de inicialización para PostgreSQL
-- Versión limpia: solo incluye columnas que realmente usa la app.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  identification VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'facturador' CHECK (role IN ('admin', 'facturador')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  phone VARCHAR(30),
  location VARCHAR(150),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  code VARCHAR(20) UNIQUE,
  brand VARCHAR(120),
  product_type VARCHAR(50) NOT NULL DEFAULT 'Bebidas',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
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
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(30) NOT NULL UNIQUE,
  customer_name VARCHAR(180),
  customer_type VARCHAR(30) NOT NULL DEFAULT 'consumidor_final',
  customer_identification VARCHAR(20) NOT NULL DEFAULT '9999999999999',
  customer_address VARCHAR(200),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(10),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  clave_acceso VARCHAR(64),
  numero_autorizacion VARCHAR(64),
  autorizacion_estado VARCHAR(30),
  recepcion_estado VARCHAR(30),
  sri_estado VARCHAR(30),
  fecha_autorizacion TIMESTAMP WITHOUT TIME ZONE,
  sri_result JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_details (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_name VARCHAR(180),
  product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS providers (
  id SERIAL PRIMARY KEY,
  company VARCHAR(100) NOT NULL,
  supplier_name VARCHAR(100),
  product_type VARCHAR(50) NOT NULL,
  product_type_other VARCHAR(50),
  scheduled_day VARCHAR(20) NOT NULL,
  contact_phone VARCHAR(15),
  contact_mode VARCHAR(20) NOT NULL CHECK (contact_mode IN ('presencial', 'telefono')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sequences (
  id SERIAL PRIMARY KEY,
  estab VARCHAR(3) NOT NULL,
  pto_emi VARCHAR(3) NOT NULL,
  doc_type VARCHAR(30) NOT NULL,
  val BIGINT NOT NULL DEFAULT 0,
  UNIQUE (estab, pto_emi, doc_type)
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS products_name_idx ON products(name);
CREATE INDEX IF NOT EXISTS products_code_idx ON products(code);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS providers_scheduled_day_idx ON providers(scheduled_day);

INSERT INTO users (username, first_name, last_name, name, email, identification, password_hash, role, is_active, phone, location)
VALUES (
  'admin',
  'Administrador',
  'Sistema',
  'Administrador Sistema',
  'admin@tesis.local',
  '0000000000',
  '$2b$10$zFn5zouaX6YYiYqnT6EU8uwOHkjrda.OuI2d60TLO1y5/.3ZyaHgG',
  'admin',
  true,
  '0000000000',
  'Sistema'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO sequences (estab, pto_emi, doc_type, val)
VALUES ('001', '001', 'FACTURA', 0)
ON CONFLICT (estab, pto_emi, doc_type) DO NOTHING;
