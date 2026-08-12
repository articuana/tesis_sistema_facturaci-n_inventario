export default function TopBar({ user, onLogout, children }) {
  return (
    <header className="dashboard-header">
      <div>
        <span>Bienvenido de nuevo,</span>
        <h2>{user?.name || user?.username}</h2>
        <small className="role-badge">{user?.role}</small>
      </div>

      <div className="dashboard-header-actions">
        {children}
        <button className="logout-button" type="button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
