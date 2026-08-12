import { useEffect, useMemo, useState } from 'react';
import { getReportSummary, sendReport as sendReportApi, downloadReportPdf } from '../services/reportService.js';
import { useAuth } from './useAuth.js';

const buildRecentMonths = (count = 6) => {
  const months = [];
  const today = new Date();
  for (let i = 0; i < count; i += 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleString('es-EC', { month: 'long' }),
      year: date.getFullYear(),
    });
  }
  return months;
};

export function useReports() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ salesToday: 0, salesMonth: 0, invoicesCountMonth: 0, salesByClient: [] });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const months = useMemo(() => buildRecentMonths(6), []);

  useEffect(() => {
    if (!user) return;
    getReportSummary(user.role).then((data) => setSummary(data || {})).catch((error) => setMessage(error.message));
  }, [user]);

  const sendReport = async (month) => {
    setSending(true); setMessage('');
    try {
      const response = await sendReportApi(month, user.role);
      setMessage(response.message || 'Reporte enviado correctamente.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  };

  const downloadReport = async (month) => {
    setSending(true); setMessage('');
    try {
      const blob = await downloadReportPdf(month, user.role);
      const fileName = `reporte-${month}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  };

  return { summary, months, sending, message, sendReport, downloadReport };
}
