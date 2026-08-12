import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <main className="app-container"><section className="login-card"><h1>Página no encontrada</h1><p>La ruta solicitada no existe.</p><Link to="/">Volver al inicio</Link></section></main>;
}
