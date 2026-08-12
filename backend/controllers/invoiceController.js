import { getInvoices, getInvoiceById, hideInvoice, createInvoice } from '../services/invoiceService.js';
import { generateInvoicePdfBuffer } from '../services/reportService.js';
import bwipjs from 'bwip-js';

const generateBarcodeDataUrl = async (text) => {
  if (!text) return null;
  const png = await bwipjs.toBuffer({
    bcid: 'code128',
    text,
    scale: 3,
    height: 20,
    includetext: false,
    paddingwidth: 10,
    paddingheight: 10,
  });
  return `data:image/png;base64,${png.toString('base64')}`;
};

const listInvoices = async (req, res) => {
  try {
    const invoices = await getInvoices();
    return res.json({ invoices });
  } catch (error) {
    console.error('Error en GET /api/invoices:', error);
    return res.status(500).json({ error: 'No se pudieron obtener las facturas.' });
  }
};

const getInvoice = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    return res.json({ invoice });
  } catch (error) {
    console.error('Error en GET /api/invoices/:id:', error);
    if (error.message.includes('Factura no encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudo obtener la factura.' });
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    const barcodeDataUrl = await generateBarcodeDataUrl(invoice.clave_acceso || invoice.invoice_number);
    const pdfBuffer = await generateInvoicePdfBuffer({
      empresa: {
        ruc: process.env.EMPRESA_RUC || '9999999999999',
        direccion: process.env.EMPRESA_DIRECCION || 'Av. Principal 123',
        direccionSucursal: process.env.EMPRESA_SUCURSAL || process.env.EMPRESA_DIRECCION || 'Av. Principal 123',
        nombreComercial: process.env.EMPRESA_NOMBRE_COMERCIAL || 'Restaurante Orense',
        razonSocial: process.env.EMPRESA_RAZON_SOCIAL || 'Restaurante Orense',
        obligadoContabilidad: process.env.EMPRESA_OBLIGADO_CONTABILIDAD || 'NO',
        regimen: process.env.EMPRESA_REGIMEN || 'Régimen General',
        datosImprenta: process.env.EMPRESA_DATOS_IMPRENTA || 'Restaurante Orense',
        correo: process.env.EMPRESA_CORREO || 'contacto@orense.com',
      },
      factura: {
        numero: invoice.invoice_number,
        fecha: invoice.created_at,
        formaPago: invoice.forma_pago || 'Efectivo',
        autorizacion: invoice.numero_autorizacion || invoice.autorizacion || 'N/A',
        fechaCaducidad: invoice.fecha_caducidad || 'N/A',
        // guiaRemision removed per template simplification
        claveAcceso: invoice.clave_acceso || null,
        barcode: barcodeDataUrl,
        ambiente: process.env.FE_AMBIENTE === '2' ? 'PRODUCCIÓN' : 'PRUEBAS',
      },
      cliente: {
        nombre: invoice.customer_name || 'Consumidor Final',
        identificacion: invoice.customer_identification || '9999999999999',
        direccion: invoice.customer_address || 'Sin dirección',
        correo: invoice.customer_email || 'no-reply@orense.com',
        telefono: invoice.customer_phone || '0000000000',
      },
      productos: invoice.details.map((detail) => {
        const name = String(detail.name || '').trim().toLowerCase();
        const menuCodeMap = {
          almuerzo: 'Alm-001',
          sopa: 'Sop-001',
          segundo: 'Seg-001',
        };
        const codigoFromName = menuCodeMap[name] || null;
        return {
          codigoPrincipal: detail.code || codigoFromName || 'Otr-001',
          descripcion: detail.name,
          detalleAdicional: '',
          cantidad: detail.quantity,
          precioUnitario: Number(detail.unit_price),
          precioTotalSinImpuesto: Number(detail.subtotal),
        };
      }),
      subtotal: Number(invoice.subtotal),
      iva: Number(invoice.tax),
      total: Number(invoice.total),
    });

    const pdfData = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_number}.pdf"`);
    res.setHeader('Content-Length', String(pdfData.length));
    return res.end(pdfData);
  } catch (error) {
    console.error('Error en GET /api/invoices/:id/pdf:', error);
    if (error.message.includes('Factura no encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudo generar el PDF de la factura.' });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const result = await hideInvoice(req.params.id);
    return res.json(result);
  } catch (error) {
    console.error('Error en DELETE /api/invoices/:id:', error);
    if (error.message.includes('Factura no encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudo ocultar la factura.' });
  }
};

const createInvoiceHandler = async (req, res) => {
  try {
    const result = await createInvoice(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error en POST /api/invoices:', error);
    return res.status(400).json({ error: error.message || 'No se pudo crear la factura.' });
  }
};

export { listInvoices, getInvoice, downloadInvoice, deleteInvoice, createInvoiceHandler };
