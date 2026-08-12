import EntityTable from '../components/common/EntityTable.jsx';
import PagePanel from '../components/common/PagePanel.jsx';
import PageToolbar from '../components/common/PageToolbar.jsx';
import InvoiceModal from '../components/modals/InvoiceModal.jsx';
import { useBilling } from '../hooks/useBilling.js';
import { formatDate, formatInvoiceCustomer } from '../utils/formatters.js';

export default function BillingPage() {
  const billing = useBilling();
  const { invoices, message, openCreate, remove, downloadInvoice } = billing;

  return (
    <>
      <PagePanel title="Facturación" description="Registra las comidas vendidas con cantidades y precios definidos." message={message}>
        <PageToolbar actions={<button type="button" className="primary-button" onClick={openCreate}>Nueva factura</button>}>
          <div>
            <strong>{invoices.length} facturas registradas</strong>
            <p className="toolbar-help">IVA de prueba aplicado: 15%</p>
          </div>
        </PageToolbar>

        <EntityTable
          headers={['Número', 'Cliente', 'Subtotal', 'IVA', 'Total', 'Fecha', 'Descargar', '']}
          rows={invoices}
          emptyMessage="Todavía no hay facturas registradas."
          renderRow={(invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.invoice_number}</td>
              <td>{formatInvoiceCustomer(invoice)}</td>
              <td>${Number(invoice.subtotal).toFixed(2)}</td>
              <td>${Number(invoice.tax).toFixed(2)}</td>
              <td><strong>${Number(invoice.total).toFixed(2)}</strong></td>
              <td>{formatDate(invoice.created_at)}</td>
              <td><button type="button" className="mini-button" onClick={() => downloadInvoice(invoice.id, invoice.invoice_number)}>Descargar</button></td>
              <td><button type="button" className="mini-button danger" onClick={() => remove(invoice.id)} aria-label="Eliminar factura">🗑</button></td>
            </tr>
          )}
        />
      </PagePanel>

      <InvoiceModal billing={billing} />
    </>
  );
}
