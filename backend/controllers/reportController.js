import { getDashboardSummary, getReportSummary, sendMonthlyReport, downloadMonthlyReport } from '../services/reportService.js';

const dashboardSummary = async (req, res) => {
  try {
    const summary = await getDashboardSummary();
    return res.json(summary);
  } catch (error) {
    console.error('Error en /api/dashboard-summary:', error);
    return res.status(500).json({ error: 'No se pudo cargar el resumen del sistema.' });
  }
};

const reportSummary = async (req, res) => {
  try {
    const summary = await getReportSummary();
    return res.json(summary);
  } catch (error) {
    console.error('Error en GET /api/reports/summary:', error);
    return res.status(500).json({ error: 'No se pudo obtener el resumen de reportería.' });
  }
};

const downloadReport = async (req, res) => {
  try {
    const month = req.query.month;
    const pdfBuffer = await downloadMonthlyReport(month);
    const fileName = `reporte-${month || 'actual'}.pdf`;
    const pdfData = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', String(pdfData.length));
    return res.end(pdfData);
  } catch (error) {
    console.error('Error en GET /api/reports/download:', error);
    return res.status(500).json({ error: error.message || 'No se pudo generar el reporte.' });
  }
};

const sendReport = async (req, res) => {
  try {
    const result = await sendMonthlyReport(req.body.month);
    return res.json(result);
  } catch (error) {
    console.error('Error en POST /api/reports/send:', error);
    return res.status(500).json({ error: error.message || 'No se pudo generar o enviar el reporte.' });
  }
};

export { dashboardSummary, reportSummary, downloadReport, sendReport };
