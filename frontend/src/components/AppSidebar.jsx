const navigationItems = [
  { value: 'dashboard', label: 'Inicio', path: '/' },
  { value: 'inventory', label: 'Inventario', path: '/inventario' },
  { value: 'billing', label: 'Facturación', path: '/facturacion' },
  { value: 'providers', label: 'Proveedores', path: '/proveedores' },
  { value: 'reports', label: 'Reportes', path: '/reportes' },
  { value: 'administration', label: 'Usuarios', path: '/usuarios', adminOnly: true },
];

export default function AppSidebar({ activeSection, user, onNavigate, onLogout, children }) {
  if (children) return <aside className="sidebar">{children}</aside>;

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/logo.jpeg" alt="Mi Tesis" />
        <p>Panel administrativo</p>
      </div>
      <nav>
        {navigationItems.filter((item) => !item.adminOnly || user?.role === 'admin').map((item) => (
          <button type="button" key={item.value} className={activeSection === item.value ? 'active' : ''} onClick={() => onNavigate(item.path)}>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="user-panel">
        <span>{user?.username}</span>
        <small>{user?.role === 'admin' ? 'Administrador' : 'Facturador'}</small>
        <button type="button" className="logout-button" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </aside>
  );
}
