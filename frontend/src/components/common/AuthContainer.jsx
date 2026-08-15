export default function AuthContainer({ children }) {
  return (
    <main className="app-container auth-layout">
      <div className="auth-hero">
        <div className="auth-copy">
          <span className="auth-kicker">Sistema administrativo</span>
          <h1>Bienvenido a OrenseFacturación</h1>
          <p>Gestiona inventario, proveedores, reportes y facturación electrónica desde una sola plataforma.</p>
        </div>
      </div>
      <div className="auth-panel">{children}</div>
    </main>
  );
}
