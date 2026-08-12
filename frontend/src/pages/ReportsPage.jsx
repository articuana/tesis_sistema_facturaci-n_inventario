import { useReports } from '../hooks/useReports.js';

export default function ReportsPage() {
  const { summary, months, sending, message, sendReport, downloadReport } = useReports();
  return (
    <section className="view-panel">
      <div className="panel-title">
        <h3>Reportería</h3>
        <p>Ventas del día, del mes, facturas emitidas y ventas por cliente.</p>
      </div>

      {message && <p className="status-message">{message}</p>}

      <div className="summary-grid">
        <article className="summary-card"><span>Ventas del día</span><strong>${Number(summary.salesToday || 0).toFixed(2)}</strong></article>
        <article className="summary-card"><span>Ventas del mes</span><strong>${Number(summary.salesMonth || 0).toFixed(2)}</strong></article>
        <article className="summary-card"><span>Facturas emitidas</span><strong>{summary.invoicesCountMonth || 0}</strong></article>
      </div>

      <div className="info-card" style={{ marginTop: 12 }}>
        <h4>Ventas por cliente (mes)</h4>
        <div style={{ maxHeight: 220, overflow: 'auto' }}>
          {!summary.salesByClient?.length ? (
            <p>No hay ventas registradas.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.salesByClient.map((item, index) => (
                  <tr key={index}>
                    <td>{item.customer_name}</td>
                    <td>${Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="info-card" style={{ marginTop: 12 }}>
        <h4>Reportes mensuales</h4>
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Año</th>
                <th>Generar y enviar</th>
                <th>Descargar</th>
              </tr>
            </thead>
            <tbody>
              {months.map((report) => (
                <tr key={report.value}>
                  <td>{report.label}</td>
                  <td>{report.year}</td>
                  <td>
                    <button type="button" className="primary-button" onClick={() => sendReport(report.value)} disabled={sending}>
                      {sending ? 'Enviando...' : 'Generar y enviar PDF'}
                    </button>
                  </td>
                  <td>
                    <button type="button" className="secondary-button" onClick={() => downloadReport(report.value)} disabled={sending}>
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
