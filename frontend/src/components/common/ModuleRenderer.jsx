import BillingModule from '../modules/BillingModule.jsx';
import DashboardModule from '../modules/DashboardModule.jsx';
import InventoryModule from '../modules/InventoryModule.jsx';
import ProvidersModule from '../modules/ProvidersModule.jsx';
import ReportsModule from '../modules/ReportsModule.jsx';
import UsersModule from '../modules/UsersModule.jsx';

export default function ModuleRenderer({ activeSection, user }) {
  if (activeSection === 'dashboard') return <DashboardModule />;
  if (activeSection === 'inventory') return <InventoryModule />;
  if (activeSection === 'billing') return <BillingModule />;
  if (activeSection === 'providers') return <ProvidersModule />;
  if (activeSection === 'reports') return <ReportsModule />;
  if (activeSection === 'administration' && user?.role === 'admin') return <UsersModule />;

  return null;
}
