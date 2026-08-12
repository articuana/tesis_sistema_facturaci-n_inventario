import { Navigate, Route, Routes } from 'react-router-dom';
import BillingPage from './pages/routes/BillingRoute.jsx';
import DashboardPage from './pages/routes/DashboardRoute.jsx';
import InventoryPage from './pages/routes/InventoryRoute.jsx';
import ProvidersPage from './pages/routes/ProvidersRoute.jsx';
import ReportsPage from './pages/routes/ReportsRoute.jsx';
import UsersPage from './pages/routes/UsersRoute.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/inventario" element={<InventoryPage />} />
      <Route path="/facturacion" element={<BillingPage />} />
      <Route path="/proveedores" element={<ProvidersPage />} />
      <Route path="/reportes" element={<ReportsPage />} />
      <Route path="/usuarios" element={<UsersPage />} />
      <Route path="/inicio" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
