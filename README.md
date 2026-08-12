# Proyecto de Gestión Administrativa y Facturación Electrónica

Este proyecto es una aplicación web para gestionar inventario, proveedores, usuarios, reportes y facturación electrónica con integración SRI para Ecuador. Está dividido en dos partes:

- Frontend: React + Vite
- Backend: Node.js + Express + PostgreSQL

## 1. Descripción general

El sistema incluye:

- Autenticación y administración de usuarios
- Gestión de inventario de productos
- Registro y programación de proveedores
- Facturación electrónica con validación SRI
- Generación de PDF de factura
- Envío de facturas por correo
- Dashboard con resumen general y calendario semanal de proveedores
- Reportes de ventas y facturación

## 2. Estructura del proyecto

```text
Proyecto Tesis/
├── backend/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── public/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── views/
│   ├── package.json
│   ├── .env.example (opcional, no se sube)
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── README.md
└── package-inspect/  # artefactos de inspección de paquetes, no forman parte de la app
a
```

## 3. Tecnologías usadas

### Backend
- Node.js
- Express
- PostgreSQL
- pg
- bcrypt
- dotenv
- cors
- nodemailer
- EJS
- Puppeteer
- facturacion-electronica-ec
- ec-sri-invoice-signer

### Frontend
- React
- Vite
- React Router DOM

## 4. Requisitos previos

Antes de ejecutar el proyecto necesitas tener instalado:

- Node.js 18 o superior
- npm
- PostgreSQL
- Git

## 5. Configuración de entorno

No se debe subir ningún archivo `.env` ni certificados sensibles al repositorio. Se recomienda crear un archivo `.env` local en la carpeta `backend` con variables como estas:

```env
DATABASE_URL=postgresql://postgres:1234@localhost:5432/proyecto_tesis
PORT=4000
NODE_ENV=development

# SRI / facturación electrónica
FE_ENABLE=true
FE_AMBIENTE=pruebas
P12_PATH=./certs/firma.p12
P12_PASSWORD=tu_password
EMPRESA_RUC=0999999999001
EMPRESA_RAZON_SOCIAL=Tu Empresa
EMPRESA_DIRECCION=Calle Principal 123
EMPRESA_CORREO=correo@empresa.com

# SMTP / correo
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=correo@empresa.com
SMTP_PASS=tu_password
SMTP_FROM=correo@empresa.com

# PDF / assets
PDF_LOGO_URL=http://localhost:4000/pdf-assets/img/logo.png
```

> Importante: la carpeta `certs/` y los archivos `.p12` no deben subirse a GitHub.

## 6. Instalación local

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## 7. Ejecución en desarrollo

### Backend

```bash
cd backend
npm run dev
```

El backend queda en:

- http://localhost:4000

### Frontend

```bash
cd frontend
npm run dev
```

El frontend queda en:

- http://localhost:5173

## 8. Usuario administrador por defecto

La base de datos crea un usuario administrador si no existe:

- Usuario: `admin`
- Contraseña: `admin123`

## 9. Funcionalidades principales

### Autenticación y administración
- Login con usuario y contraseña
- Registro de usuarios
- Roles: `admin` y `facturador`
- Edición y desactivación de usuarios

### Inventario
- Crear, listar y gestionar productos
- Control de stock
- Tipos de productos predefinidos

### Proveedores
- Registro de proveedores
- Día programado por semana
- Modo de contacto: presencial o telefónico
- Validación de teléfono según el modo activo

### Facturación
- Registro de clientes y facturas
- Validación de identificación y datos del cliente
- Cálculo de subtotal, IVA y total
- Generación de XML y firmar documentos SRI
- Generación de PDF para impresión y envío

### Reportes
- Dashboard con número total de facturas
- Productos recientes
- Facturas recientes
- Calendario semanal de proveedores

## 10. Despliegue recomendado

La configuración recomendada es:

- Supabase: base de datos PostgreSQL
- Render: backend Node.js
- Vercel: frontend React/Vite

### Backend en Render
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Variables de entorno: `DATABASE_URL`, `NODE_ENV`, `FE_*`, `SMTP_*`, etc.

### Frontend en Vercel
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Variable de entorno: `VITE_API_URL=https://tu-backend.onrender.com`

## 11. Variables de entorno recomendadas

### Backend
```env
DATABASE_URL=postgresql://...
PORT=4000
NODE_ENV=production
```

### Frontend
```env
VITE_API_URL=https://tu-backend.onrender.com
```

## 12. Buenas prácticas

- No subir archivos `.env` ni certificados `.p12` al repositorio
- Usar `.gitignore` para excluir secretos y artefactos locales
- Separar backend y frontend en despliegues distintos
- Mantener la base de datos en Supabase o un servicio equivalente
- Usar variables de entorno en Render/Vercel para secretos reales

## 13. Notas finales

Este proyecto está pensado para uso administrativo con integración de facturación electrónica para Ecuador. Por esa razón, el backend incluye lógica de validación de documentos, firma electrónica, secuencias de facturación, generación PDF y envío por correo.

Si vas a desplegarlo en producción, asegúrate de:

- configurar la base de datos real
- cargar el certificado `.p12` en el entorno seguro correspondiente
- validar la conectividad con el SRI
- cambiar credenciales por defecto del usuario administrador
