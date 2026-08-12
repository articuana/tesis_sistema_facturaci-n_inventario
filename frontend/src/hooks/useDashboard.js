import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/reportService.js';
import { getProviders } from '../services/providerService.js';
import { startOfWeek } from '../utils/formatters.js';
import { useAuth } from './useAuth.js';

export function useDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalInvoices: 0, totalProducts: 0, latestProducts: [], latestInvoices: [] });
  const [calendarWeekProviders, setCalendarWeekProviders] = useState([]);
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [dashboardResult, providersResult] = await Promise.allSettled([
          getDashboardSummary(user.role),
          getProviders(user.role),
        ]);

        if (dashboardResult.status === 'fulfilled') {
          setSummary(dashboardResult.value);
        }

        if (providersResult.status === 'fulfilled') {
          setCalendarWeekProviders(providersResult.value.providers || []);
        }
      } catch { /* La página conserva el último resumen disponible. */ }
    };
    load();
  }, [user]);
  return { summary, calendarWeekProviders };
}
