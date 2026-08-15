export default function LoginCard({ username, password, loading, message, onUsernameChange, onPasswordChange, onSubmit }) {
  return (
    <section className="login-card">
      <div className="login-header">
        <h2>Iniciar sesión</h2>
        <p>Accede a tu panel administrativo.</p>
      </div>

      <form onSubmit={onSubmit}>
        <label>
          Usuario
          <input
            type="text"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            required
            placeholder="usuario123"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
            placeholder="********"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : 'Ingresar'}
        </button>
      </form>

      {message && <p className="status-message">{message}</p>}
    </section>
  );
}
