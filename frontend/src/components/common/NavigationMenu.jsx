function pathForSection(section) {
  return {
    dashboard: '/',
    inventory: '/inventario',
    billing: '/facturacion',
    providers: '/proveedores',
    reports: '/reportes',
    administration: '/usuarios',
  }[section] || '/';
}

export default function NavigationMenu({ activeSection, user, onNavigate }) {
  const sections = [
    { value: 'dashboard', label: 'Inicio' },
    { value: 'inventory', label: 'Inventario' },
    { value: 'billing', label: 'Facturación' },
    { value: 'providers', label: 'Proveedores' },
    { value: 'reports', label: 'Reportes' },
    ...(user?.role === 'admin' ? [{ value: 'administration', label: 'Administración' }] : []),
  ];

  return (
    <nav>
      {sections.map((section) => (
        <button
          type="button"
          key={section.value}
          className={activeSection === section.value ? 'active' : ''}
          onClick={() => onNavigate(pathForSection(section.value))}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
