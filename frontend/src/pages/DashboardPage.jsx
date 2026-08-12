import PagePanel from '../components/common/PagePanel.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import { formatDate, startOfWeek } from '../utils/formatters.js';

const normalizeWeekday = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

export default function DashboardPage() {
  const { summary, calendarWeekProviders } = useDashboard();
  const start = startOfWeek(new Date());

  return (
    <PagePanel title="Resumen principal" description="Vista rápida del estado general del sistema.">
      <div className="summary-grid">
        <article className="summary-card"><span>Facturas emitidas</span><strong>{summary.totalInvoices}</strong></article>
        <article className="summary-card"><span>Productos en inventario</span><strong>{summary.totalProducts}</strong></article>
      </div>

      <div className="summary-panels">
        <article className="info-card">
          <h4>Últimos productos agregados</h4>
          {summary.latestProducts.length === 0 ? <p>No hay productos registrados todavía.</p> : <ul className="list-rows">{summary.latestProducts.map((product) => <li key={product.id}><div><strong>{product.name}</strong><span>{product.brand || 'Sin marca'}</span></div><small>{product.quantity} unidades</small></li>)}</ul>}
        </article>

        <article className="info-card">
          <h4>Últimas facturas emitidas</h4>
          {summary.latestInvoices.length === 0 ? <p>Aún no hay facturas registradas.</p> : <ul className="list-rows">{summary.latestInvoices.map((invoice) => <li key={invoice.id}><div><strong>{invoice.invoice_number}</strong><span>{invoice.customer_name || 'Cliente sin nombre'}</span></div><small>{formatDate(invoice.created_at)}</small></li>)}</ul>}
        </article>

        <article className="info-card">
          <h4>Calendario de proveedores (semana)</h4>
          <div className="calendar-week-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {Array.from({ length: 7 }).map((_, index) => {
              const date = new Date(start);
              date.setDate(start.getDate() + index);
              const weekdayMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
              const key = weekdayMap[date.getDay()];
              const items = calendarWeekProviders.filter((provider) => normalizeWeekday(provider.scheduled_day) === normalizeWeekday(key));

              return (
                <div key={`${key}-${index}`} style={{ border: '1px solid #eee', padding: 6, minHeight: 60 }}>
                  <strong>{date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                  <ul style={{ marginTop: 6 }}>
                    {items.length === 0 ? <li style={{ fontSize: 12, color: '#666' }}>—</li> : items.map((item) => <li key={item.id} style={{ fontSize: 12 }}>{item.company}{item.supplier_name ? ` — ${item.supplier_name}` : ''}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </PagePanel>
  );
}
