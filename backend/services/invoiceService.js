import { pool } from '../config/database.js';
import { roundCurrency } from '../utils/helpers.js';
import { normalizeCustomer } from '../validators/invoiceValidator.js';
import { generateInvoicePdfBuffer, sendInvoiceEmail } from '../services/reportService.js';
import { getCurrentInvoiceDate } from '../utils/helpers.js';
import fs from 'fs';
import bwipjs from 'bwip-js';
import { FacturacionElectronicaEC } from 'facturacion-electronica-ec';
import PostgresSequenceProvider from './PostgresSequenceProvider.js';
import path from 'path';

// Initialize FacturacionElectronicaEC SDK if configured
let fe = null;
try {
  if (process.env.FE_ENABLE === 'true') {
    const p12Path = process.env.P12_PATH;

    if (!p12Path) {
      throw new Error('P12_PATH no definido');
    }

    if (process.env.P12_BASE64) {
      const directory = path.dirname(p12Path);

      fs.mkdirSync(directory, { recursive: true });

      fs.writeFileSync(
        p12Path,
        Buffer.from(process.env.P12_BASE64, 'base64')
      );

      console.log('Certificado P12 reconstruido correctamente.');
    }

    const p12 = fs.readFileSync(p12Path);

    console.log('Certificado P12 cargado correctamente.');

    const emisor = {
      ruc: process.env.EMISOR_RUC || process.env.EMPRESA_RUC || '0999999999001',
      razonSocial: process.env.EMISOR_RAZON_SOCIAL || process.env.EMPRESA_NOMBRE || 'MI EMPRESA S.A.',
      dirMatriz: process.env.EMISOR_DIR_MATRIZ || process.env.EMPRESA_DIRECCION || 'Ciudad',
      establecimiento: process.env.EMISOR_ESTABLECIMIENTO || '001',
      puntoEmision: process.env.EMISOR_PTO_EMISION || '001',
      direccionEstablecimiento: process.env.EMISOR_DIRECCION_ESTABLECIMIENTO || process.env.EMPRESA_DIRECCION || 'Sucursal',
      obligadoContabilidad: (process.env.EMISOR_OBLIGADO_CONTABILIDAD || 'true') === 'true',
      ambiente: process.env.FE_AMBIENTE === '2' ? '2' : '1',
    };

    const sriLogger = {
      info: (message, meta) => console.log(message, meta || ''),
      warn: (message, meta) => console.warn(message, meta || ''),
      error: (message, meta) => console.error(message, meta || ''),
      debug: (message, meta) => {
        if (process.env.FE_DEBUG === 'true') {
          console.debug(message, meta || '');
        }
      },
    };

    const defaultFetch = typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null;
    const fetchFn = async (resource, init) => {
      if (!defaultFetch) {
        throw new Error('fetch no disponible en este entorno');
      }
      const requestInit = {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          Accept: 'text/xml',
          'Content-Type': 'text/xml;charset=UTF-8',
        },
      };
      if (requestInit.headers.SOAPAction === '') {
        delete requestInit.headers.SOAPAction;
      }

      sriLogger.debug('[SRI] fetch request', {
        url: typeof resource === 'string' ? resource : resource.url,
        headers: requestInit.headers,
        bodyLength: typeof requestInit.body === 'string' ? requestInit.body.length : undefined,
      });

      const response = await defaultFetch(resource, requestInit);

      sriLogger.debug('[SRI] fetch response', {
        status: response.status,
        statusText: response.statusText,
        url: typeof resource === 'string' ? resource : resource.url,
      });
      return response;
    };

    fe = new FacturacionElectronicaEC({
      emisor,
      p12,
      p12Password: process.env.P12_PASSWORD || '',
      sequenceProvider: new PostgresSequenceProvider(),
      validateXsd: process.env.FE_VALIDATE_XSD === 'true',
      logger: sriLogger,
      fetch: fetchFn,
      timeoutMs: Number(process.env.FE_SRI_TIMEOUT_MS || '60000'),
    });
  }
} catch (err) {
  console.warn('No se pudo inicializar FacturacionElectronicaEC:', err.message || err);
  fe = null;
}

const FOOD_MENU = {
  almuerzo: { name: 'Almuerzo', price: 3 },
  sopa: { name: 'Sopa', price: 1.7 },
  segundo: { name: 'Segundo', price: 2 },
};

const getInvoices = async () => {
  const result = await pool.query(
    `SELECT id, invoice_number, customer_name, customer_type, customer_identification, customer_address, customer_email, customer_phone, subtotal, tax, total, created_at,
            clave_acceso, numero_autorizacion, autorizacion_estado, recepcion_estado, sri_estado, fecha_autorizacion
     FROM invoices
     WHERE COALESCE(is_visible, true)
     ORDER BY created_at DESC`
  );

  return result.rows;
};

const getInvoiceById = async (id) => {
  const invoiceResult = await pool.query(
    `SELECT id, invoice_number, customer_name, customer_type, customer_identification, customer_address, customer_email, customer_phone, subtotal, tax, total, created_at,
            clave_acceso, numero_autorizacion, autorizacion_estado, recepcion_estado, sri_estado, fecha_autorizacion, sri_result
     FROM invoices
     WHERE id = $1 AND COALESCE(is_visible, true)`,
    [id]
  );

  if (invoiceResult.rowCount === 0) {
    throw new Error('Factura no encontrada.');
  }

  const detailsResult = await pool.query(
    `SELECT details.id, details.product_id, COALESCE(details.item_name, products.name) AS name, products.code,
            details.quantity, details.unit_price, details.subtotal
     FROM invoice_details details
     LEFT JOIN products ON products.id = details.product_id
     WHERE details.invoice_id = $1
     ORDER BY details.id ASC`,
    [id]
  );

  return { ...invoiceResult.rows[0], details: detailsResult.rows };
};

const hideInvoice = async (id) => {
  const result = await pool.query(
    `UPDATE invoices
     SET is_visible = false
     WHERE id = $1 AND COALESCE(is_visible, true)
     RETURNING id`,
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error('Factura no encontrada o ya ocultada.');
  }

  return { message: 'Factura oculta de la vista correctamente.' };
};

const createInvoice = async (payload) => {
  const { customerType, customerIdentification, customerName, customerAddress, customerEmail, customerPhone, items = [] } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('La factura debe tener al menos una comida.');
  }

  const normalizedItems = items.map((item) => {
    const fixedMeal = FOOD_MENU[item.itemType];
    const isOtherMeal = item.itemType === 'otro';

    // Assign a principal code for fixed menu items; 'otro' will get provided code or a generic 'OTRO'
    const codeMap = {
      almuerzo: 'Alm-001',
      sopa: 'Sop-001',
      segundo: 'Seg-001',
    };

    const resolvedName = fixedMeal ? fixedMeal.name : String(item.itemName || '').trim();
    const resolvedPrice = fixedMeal ? fixedMeal.price : roundCurrency(Number(item.unitPrice));
    const resolvedCode = fixedMeal ? codeMap[item.itemType] : (String(item.itemCode || '').trim() || 'Otr-001');

    return {
      itemName: resolvedName,
      quantity: Number(item.quantity),
      unitPrice: resolvedPrice,
      isValidType: Boolean(fixedMeal || isOtherMeal),
      hasPrice: Boolean(fixedMeal || (isOtherMeal && String(item.unitPrice ?? '').trim())),
      itemCode: resolvedCode,
    };
  });

  if (normalizedItems.some((item) => !item.isValidType || !item.itemName || item.itemName.length > 180 || !Number.isInteger(item.quantity) || item.quantity < 1 || !item.hasPrice || !Number.isFinite(item.unitPrice) || item.unitPrice < 0)) {
    throw new Error('Cada comida debe ser Almuerzo, Sopa, Segundo u Otro, con nombre, cantidad y precio válidos.');
  }

  const customer = normalizeCustomer({ customerType, customerIdentification, customerName, customerAddress, customerEmail, customerPhone });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingResult = await client.query(
      `SELECT name, address, email, phone
       FROM customers
       WHERE identification_type = $1 AND identification = $2`,
      [customer.customerType, customer.customerIdentification]
    );

    const existingCustomer = existingResult.rowCount > 0 ? existingResult.rows[0] : null;
    const invoiceCustomer = {
      ...customer,
      customerName: customer.customerName || '',
      customerAddress: customer.customerAddress || '',
      customerEmail: customer.customerEmail || '',
      customerPhone: customer.customerPhone || '',
    };

    if (!existingCustomer) {
      await client.query(
        `INSERT INTO customers (identification_type, identification, name, address, email, phone)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [customer.customerType, customer.customerIdentification, invoiceCustomer.customerName, invoiceCustomer.customerAddress, invoiceCustomer.customerEmail, invoiceCustomer.customerPhone]
      );
    }


    const subtotal = roundCurrency(normalizedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
    const tax = roundCurrency(subtotal * 0.15);
    const total = roundCurrency(subtotal + tax);
    const invoiceIdResult = await client.query("SELECT nextval(pg_get_serial_sequence('invoices', 'id')) AS id");
    const invoiceId = Number(invoiceIdResult.rows[0].id);
    let invoiceNumber = `001-001-${String(invoiceId).padStart(9, '0')}`;

    await client.query(
      `INSERT INTO invoices (id, invoice_number, customer_name, customer_type, customer_identification, customer_address, customer_email, customer_phone, subtotal, tax, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [invoiceId, invoiceNumber, invoiceCustomer.customerName, invoiceCustomer.customerType, invoiceCustomer.customerIdentification, invoiceCustomer.customerAddress, invoiceCustomer.customerEmail, invoiceCustomer.customerPhone, subtotal, tax, total]
    );

    for (const item of normalizedItems) {
      const lineSubtotal = roundCurrency(item.quantity * item.unitPrice);
      await client.query(
        `INSERT INTO invoice_details (invoice_id, item_name, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, NULL, $3, $4, $5)`,
        [invoiceId, item.itemName, item.quantity, item.unitPrice, lineSubtotal]
      );
    }

    await client.query('COMMIT');

    // If FE emission is enabled, emit before generating final PDF so clave/autorization are available
    let feResult = null;
    if (process.env.FE_ENABLE === 'true' && fe) {
      try {
        const detalles = normalizedItems.map((item) => {
          const lineSubtotal = roundCurrency(item.quantity * item.unitPrice);
          const itemTax = roundCurrency(lineSubtotal * 0.15);
          return {
            codigoPrincipal: item.itemCode || item.itemName || '000',
            descripcion: item.itemName,
            cantidad: item.quantity,
            precioUnitario: item.unitPrice,
            descuento: 0,
            precioTotalSinImpuesto: lineSubtotal,
            impuestos: [{ codigo: '2', codigoPorcentaje: process.env.FE_IVA_CODIGO_PORCENTAJE || '4', tarifa: Number(process.env.FE_IVA_TARIFA || 15), baseImponible: lineSubtotal, valor: itemTax }],
          };
        });

        const customerTypeUpper = String(invoiceCustomer.customerType || '').trim().toUpperCase();
        const data = {
          fechaEmision: getCurrentInvoiceDate(),
          tipoIdentificacionComprador: customerTypeUpper === 'RUC' ? '04' : (customerTypeUpper === 'CEDULA' ? '05' : '07'),
          razonSocialComprador: invoiceCustomer.customerName || 'CONSUMIDOR FINAL',
          identificacionComprador: invoiceCustomer.customerIdentification || '9999999999999',
          totalSinImpuestos: subtotal,
          totalDescuento: 0,
          totalConImpuestos: [{ codigo: '2', codigoPorcentaje: process.env.FE_IVA_CODIGO_PORCENTAJE || '4', baseImponible: subtotal, valor: tax }],
          propina: 0,
          importeTotal: total,
          pagos: [{ formaPago: '01', total }],
          detalles,
        };

        feResult = await fe.emitirFactura(data);

        if (feResult) {
          // Si el SRI/librería generó un secuencial,
          // usamos ese mismo valor para el número de factura.
          if (feResult.secuencial) {
            invoiceNumber = `001-001-${String(feResult.secuencial).padStart(9, '0')}`;

            console.log(
              'FACTURA: sincronizando invoice_number con secuencial SRI:',
              invoiceNumber
            );

            await client.query(
              `UPDATE invoices
              SET invoice_number = $1
              WHERE id = $2`,
              [invoiceNumber, invoiceId]
            );
          }

          await client.query(
            `UPDATE invoices
            SET clave_acceso = $1,
                numero_autorizacion = $2,
                autorizacion_estado = $3,
                recepcion_estado = $4,
                sri_estado = $5,
                fecha_autorizacion = $6,
                sri_result = $7
            WHERE id = $8`,
            [
              feResult.claveAcceso || null,
              feResult.numeroAutorizacion || null,
              feResult.autorizacionEstado || null,
              feResult.recepcionEstado || null,
              feResult.estado || null,
              feResult.fechaAutorizacion
                ? new Date(feResult.fechaAutorizacion)
                : null,
              JSON.stringify(feResult),
              invoiceId,
            ]
          );
        }
      } catch (err) {
        console.warn('Error al emitir factura electrónica:', err.message || err);
      }
    }

    // Generate barcode for the (possible) claveAcceso or fallback to invoice number
    const generateBarcodeDataUrl = async (text) => {
      try {
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
      } catch (e) {
        console.warn('No se pudo generar el código de barras:', e.message || e);
        return null;
      }
    };

    const barcodeDataUrl = await generateBarcodeDataUrl((feResult && feResult.claveAcceso) || invoiceNumber);

    const ambienteLabel = process.env.FE_AMBIENTE === '2' ? 'PRODUCCIÓN' : 'PRUEBAS';

    const pdfBuffer = await generateInvoicePdfBuffer({
      empresa: {
        ruc: process.env.EMPRESA_RUC || '9999999999999',
        direccion: process.env.EMPRESA_DIRECCION || 'Av. Principal 123',
        telefono: process.env.EMPRESA_TELEFONO || '0999999999',
        correo: process.env.EMPRESA_CORREO || 'contacto@orense.com',
      },
      factura: {
        numero: invoiceNumber,
        fecha: getCurrentInvoiceDate(),
        formaPago: 'Efectivo',
        autorizacion: feResult && feResult.numeroAutorizacion ? feResult.numeroAutorizacion : 'N/A',
        fechaAutorizacion: feResult && feResult.fechaAutorizacion ? new Date(feResult.fechaAutorizacion) : null,
        claveAcceso: feResult && feResult.claveAcceso ? feResult.claveAcceso : null,
        barcode: barcodeDataUrl,
        ambiente: ambienteLabel,
      },
      cliente: {
        nombre: invoiceCustomer.customerName,
        identificacion: invoiceCustomer.customerIdentification,
        direccion: invoiceCustomer.customerAddress,
        correo: invoiceCustomer.customerEmail,
        telefono: invoiceCustomer.customerPhone,
      },
      productos: normalizedItems.map((item) => ({
        codigoPrincipal: item.itemCode || '',
        descripcion: item.itemName,
        detalleAdicional: '',
        cantidad: item.quantity,
        precioUnitario: item.unitPrice,
        descuento: 0,
        precioTotalSinImpuesto: Number((item.quantity * item.unitPrice).toFixed(2)),
      })),
      subtotal,
      iva: tax,
      total,
    });

    if (invoiceCustomer.customerEmail) {
      console.log(
        'FACTURA: correo del cliente detectado:',
        invoiceCustomer.customerEmail
      );

      try {
        console.log('FACTURA: llamando a sendInvoiceEmail...');

        const emailResult = await sendInvoiceEmail(
          invoiceCustomer.customerEmail,
          `Factura Restaurante Orense ${getCurrentInvoiceDate()}`,
          `Adjunto encontrará su factura ${invoiceNumber}. Gracias por preferir Restaurante Orense.`,
          pdfBuffer,
          invoiceNumber
        );

        console.log('FACTURA: sendInvoiceEmail terminó correctamente.');
        console.log('FACTURA: messageId:', emailResult.messageId);

      } catch (emailErr) {
        console.error('FACTURA: ERROR AL ENVIAR CORREO:', {
          message: emailErr.message,
          code: emailErr.code,
          responseCode: emailErr.responseCode,
          response: emailErr.response,
        });
      }
    } else {
      console.log(
        `FACTURA: no se envió ${invoiceNumber} porque no existe correo del cliente.`
      );
    }

    

    const invoiceResponse = {
      id: invoiceId,
      invoiceNumber,
      ...invoiceCustomer,
      subtotal,
      tax,
      total,
    };

    if (feResult) {
      invoiceResponse.claveAcceso = feResult.claveAcceso;
      invoiceResponse.numeroAutorizacion = feResult.numeroAutorizacion;
      invoiceResponse.autorizacionEstado = feResult.autorizacionEstado;
      invoiceResponse.recepcionEstado = feResult.recepcionEstado;
      invoiceResponse.sriEstado = feResult.estado;
      invoiceResponse.fechaAutorizacion = feResult.fechaAutorizacion;
    }

    return { invoice: invoiceResponse, feResult };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(error.message || 'No se pudo crear la factura.');
  } finally {
    client.release();
  }
};

export { getInvoices, getInvoiceById, hideInvoice, createInvoice };
