import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import puppeteer from 'puppeteer';
import { Resend } from 'resend';
import { pool } from '../config/database.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  'Restaurante Orense <onboarding@resend.dev>';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

console.log('[RESEND] Configuración detectada:', {
  configurado: Boolean(process.env.RESEND_API_KEY),
  from: EMAIL_FROM,
});

const renderInvoiceTemplate = async (data) => {
  const templatePath = path.join(__dirname, '..', 'views', 'factura.ejs');
  return ejs.renderFile(templatePath, data, { async: true });
};

const generateInvoicePdfBuffer = async (invoiceData) => {
  const logoUrl = process.env.PDF_LOGO_URL || `http://localhost:${process.env.PORT || 4000}/pdf-assets/img/logo.png`;
  // Ensure dates are strings in DD/MM/YYYY format for the template
  const safeInvoiceData = { ...invoiceData };
  safeInvoiceData.factura = { ...(invoiceData.factura || {}) };
  if (safeInvoiceData.factura.fecha instanceof Date) {
    safeInvoiceData.factura.fecha = safeInvoiceData.factura.fecha.toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  if (safeInvoiceData.factura.fecha && !(typeof safeInvoiceData.factura.fecha === 'string')) {
    try {
      const d = new Date(safeInvoiceData.factura.fecha);
      if (!Number.isNaN(d.getTime())) {
        safeInvoiceData.factura.fecha = d.toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
    } catch (e) {
      // leave as-is
    }
  }

  if (safeInvoiceData.factura.fechaAutorizacion instanceof Date) {
    safeInvoiceData.factura.fechaAutorizacion = safeInvoiceData.factura.fechaAutorizacion.toLocaleString('es-EC');
  }

  const html = await renderInvoiceTemplate({
    ...safeInvoiceData,
    empresa: {
      ...invoiceData.empresa,
      logoUrl,
    },
  });
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', url: `http://localhost:${process.env.PORT || 4000}/` });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
  await browser.close();
  return pdfBuffer;
};

const renderReportTemplate = async (data) => {
  const templatePath = path.join(__dirname, '..', 'views', 'report.ejs');
  return ejs.renderFile(templatePath, data, { async: true });
};

const generateReportPdfBuffer = async (reportData) => {
  const html = await renderReportTemplate(reportData);
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', url: `http://localhost:${process.env.PORT || 4000}/` });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
  await browser.close();
  return pdfBuffer;
};

const pdfBase64 = pdfBuffer.toString('base64');

const { data, error } = await resend.emails.send({
  from: EMAIL_FROM,
  to: [to],
  subject,
  text,
  attachments: [
    {
      filename: `${invoiceNumber}.pdf`,
      content: pdfBase64,
    },
  ],
});

const sendReportEmail = async (
  to,
  subject,
  text,
  pdfBuffer,
  filename = 'reporte.pdf'
) => {
  if (!resend) {
    throw new Error(
      'Resend no está configurado. Define RESEND_API_KEY en las variables de entorno.'
    );
  }

  if (!pdfBuffer) {
    throw new Error('No se recibió el PDF del reporte.');
  }

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    text,
    attachments: [
      {
        filename,
        content: pdfBuffer.toString('base64'),
      },
    ],
  });

  if (error) {
    console.error('REPORT EMAIL: error de Resend:', error);
    throw new Error(error.message || 'No se pudo enviar el reporte.');
  }

  console.log('REPORT EMAIL: enviado correctamente:', data?.id);

  return data;
};

const sendInvoiceEmail = async (
  to,
  subject,
  text,
  pdfBuffer,
  invoiceNumber
) => {
  console.log('EMAIL: entrando a sendInvoiceEmail');
  console.log('EMAIL: destinatario:', to);
  console.log('EMAIL: factura:', invoiceNumber);
  console.log('EMAIL: PDF recibido:', Boolean(pdfBuffer));

  if (!resend) {
    throw new Error(
      'Resend no está configurado. Define RESEND_API_KEY en las variables de entorno.'
    );
  }

  if (!pdfBuffer) {
    throw new Error('No se recibió el PDF de la factura.');
  }

  console.log('EMAIL: tipo de PDF:', typeof pdfBuffer);
  console.log('EMAIL: es Buffer:', Buffer.isBuffer(pdfBuffer));
  console.log('EMAIL: tamaño PDF:', pdfBuffer.length);
  console.log(
    'EMAIL: encabezado PDF:',
    Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer.subarray(0, 10).toString()
      : 'NO ES BUFFER'
  );


  try {
    console.log('EMAIL: intentando enviar correo mediante Resend...');

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject,
      text,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    });

    if (error) {
      console.error('EMAIL: error devuelto por Resend:', error);
      throw new Error(error.message || 'Resend no pudo enviar el correo.');
    }

    console.log('EMAIL: correo enviado correctamente mediante Resend.');
    console.log('EMAIL: messageId:', data?.id);

    return data;

  } catch (error) {
    console.error('EMAIL: error al enviar correo mediante Resend:', {
      message: error.message,
      name: error.name,
    });

    throw error;
  }
};
const getDashboardSummary = async () => {
  const [invoiceCount, productCount, latestProducts, latestInvoices] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM invoices'),
    pool.query('SELECT COUNT(*)::int AS total FROM products'),
    pool.query('SELECT id, name, quantity, code, brand, created_at FROM products ORDER BY created_at DESC LIMIT 5'),
    pool.query('SELECT id, invoice_number, customer_name, total, created_at FROM invoices ORDER BY created_at DESC LIMIT 5'),
  ]);

  return {
    totalInvoices: invoiceCount.rows[0].total,
    totalProducts: productCount.rows[0].total,
    latestProducts: latestProducts.rows,
    latestInvoices: latestInvoices.rows,
  };
};

const getReportSummary = async () => {
  const todayResult = await pool.query(
    `SELECT COALESCE(SUM(total),0)::numeric(12,2) AS sales_today
     FROM invoices
     WHERE COALESCE(is_visible, true) AND created_at::date = CURRENT_DATE`
  );

  const monthResult = await pool.query(
    `SELECT COALESCE(SUM(total),0)::numeric(12,2) AS sales_month, COUNT(*)::int AS invoices_count
     FROM invoices
     WHERE COALESCE(is_visible, true) AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)`
  );

  const byClient = await pool.query(
    `SELECT COALESCE(customer_name, 'Consumidor final') AS customer_name, COALESCE(SUM(total),0)::numeric(12,2) AS total
     FROM invoices
     WHERE COALESCE(is_visible, true) AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
     GROUP BY customer_name
     ORDER BY total DESC
     LIMIT 50`
  );

  return {
    salesToday: Number(monthResult.rows?.length ? todayResult.rows[0].sales_today : todayResult.rows[0].sales_today),
    salesMonth: Number(monthResult.rows[0].sales_month),
    invoicesCountMonth: Number(monthResult.rows[0].invoices_count),
    salesByClient: byClient.rows,
  };
};

const sendMonthlyReport = async (month) => {
  let startDate, endDate, monthLabel;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    startDate = new Date(y, m - 1, 1);
    endDate = new Date(y, m, 0);
    monthLabel = `${startDate.toLocaleString('es-EC', { month: 'long', year: 'numeric' })}`;
  } else {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthLabel = `${now.toLocaleString('es-EC', { month: 'long', year: 'numeric' })}`;
  }

  const startISO = startDate.toISOString().slice(0, 10);
  const endISO = endDate.toISOString().slice(0, 10);

  const summaryResult = await pool.query(
    `SELECT COALESCE(SUM(total),0)::numeric(12,2) AS sales_month, COUNT(*)::int AS invoices_count
     FROM invoices
     WHERE COALESCE(is_visible, true) AND created_at::date BETWEEN $1 AND $2`,
    [startISO, endISO]
  );

  const byClient = await pool.query(
    `SELECT COALESCE(customer_name, 'Consumidor final') AS customer_name, COALESCE(SUM(total),0)::numeric(12,2) AS total
     FROM invoices
     WHERE COALESCE(is_visible, true) AND created_at::date BETWEEN $1 AND $2
     GROUP BY customer_name
     ORDER BY total DESC
     LIMIT 200`,
    [startISO, endISO]
  );

  const invoicesList = await pool.query(
    `SELECT id, invoice_number, customer_name, total, created_at
     FROM invoices
     WHERE COALESCE(is_visible, true) AND created_at::date BETWEEN $1 AND $2
     ORDER BY created_at ASC`,
    [startISO, endISO]
  );

  const reportData = {
    empresa: {
      ruc: process.env.EMPRESA_RUC || '9999999999999',
      direccion: process.env.EMPRESA_DIRECCION || 'Av. Principal 123',
      telefono: process.env.EMPRESA_TELEFONO || '0999999999',
      correo: process.env.EMPRESA_CORREO || 'contacto@orense.com',
    },
    periodo: monthLabel,
    summary: {
      salesMonth: Number(summaryResult.rows[0].sales_month),
      invoicesCount: Number(summaryResult.rows[0].invoices_count),
    },
    salesByClient: byClient.rows,
    invoices: invoicesList.rows,
  };

  const pdfBuffer = await generateReportPdfBuffer(reportData);
  const recipient = process.env.SMTP_USER || (process.env.EMAIL_FROM || '').replace(/^.*<|>.*$/g, '');
  const subject = `Reporte Restaurante Orense ${monthLabel}`;
  await sendReportEmail(recipient, subject, `Adjunto reporte del periodo: ${monthLabel}`, pdfBuffer, `reporte-${monthLabel.replace(/\s+/g, '_')}.pdf`);

  return { success: true, message: `Reporte enviado a ${recipient}` };
};

const downloadMonthlyReport = async (month) => {
  let startDate, endDate, monthLabel;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    startDate = new Date(y, m - 1, 1);
    endDate = new Date(y, m, 0);
    monthLabel = `${startDate.toLocaleString('es-EC', { month: 'long', year: 'numeric' })}`;
  } else {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthLabel = `${now.toLocaleString('es-EC', { month: 'long', year: 'numeric' })}`;
  }

  const startISO = startDate.toISOString().slice(0, 10);
  const endISO = endDate.toISOString().slice(0, 10);

  const summaryResult = await pool.query(
    `SELECT COALESCE(SUM(total),0)::numeric(12,2) AS sales_month, COUNT(*)::int AS invoices_count
     FROM invoices
     WHERE COALESCE(is_visible, true) AND created_at::date BETWEEN $1 AND $2`,
    [startISO, endISO]
  );

  const byClient = await pool.query(
    `SELECT COALESCE(customer_name, 'Consumidor final') AS customer_name, COALESCE(SUM(total),0)::numeric(12,2) AS total
     FROM invoices
     WHERE COALESCE(is_visible, true) AND created_at::date BETWEEN $1 AND $2
     GROUP BY customer_name
     ORDER BY total DESC
     LIMIT 200`,
    [startISO, endISO]
  );

  const invoicesList = await pool.query(
    `SELECT id, invoice_number, customer_name, total, created_at
     FROM invoices
     WHERE COALESCE(is_visible, true) AND created_at::date BETWEEN $1 AND $2
     ORDER BY created_at ASC`,
    [startISO, endISO]
  );

  const reportData = {
    empresa: {
      ruc: process.env.EMPRESA_RUC || '9999999999999',
      direccion: process.env.EMPRESA_DIRECCION || 'Av. Principal 123',
      telefono: process.env.EMPRESA_TELEFONO || '0999999999',
      correo: process.env.EMPRESA_CORREO || 'contacto@orense.com',
    },
    periodo: monthLabel,
    summary: {
      salesMonth: Number(summaryResult.rows[0].sales_month),
      invoicesCount: Number(summaryResult.rows[0].invoices_count),
    },
    salesByClient: byClient.rows,
    invoices: invoicesList.rows,
  };

  return generateReportPdfBuffer(reportData);
};

export { generateInvoicePdfBuffer, generateReportPdfBuffer, sendReportEmail, sendInvoiceEmail, getDashboardSummary, getReportSummary, sendMonthlyReport, downloadMonthlyReport };
