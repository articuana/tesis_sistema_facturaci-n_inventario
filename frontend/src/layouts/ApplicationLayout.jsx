import { useEffect, useState } from 'react';
import AppSidebar from '../components/AppSidebar.jsx';
import AuthContainer from '../components/common/AuthContainer.jsx';
import LoginCard from '../components/common/LoginCard.jsx';
import ModuleRenderer from '../components/common/ModuleRenderer.jsx';
import NavigationMenu from '../components/common/NavigationMenu.jsx';
import NotificationBanner from '../components/common/NotificationBanner.jsx';
import TopBar from '../components/common/TopBar.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getProviders } from '../services/providerService.js';

export default function ApplicationLayout({ activeSection, onNavigate }) {
  const { user, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [providerNotification, setProviderNotification] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (activeSection === 'administration' && user.role !== 'admin') {
      onNavigate('/', { replace: true });
    }
  }, [activeSection, onNavigate, user]);

  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);
    const notifiedKey = `providers-notified-${today}`;
    const alreadyNotified = typeof window !== 'undefined' && window.localStorage.getItem(notifiedKey);

    if (alreadyNotified) return;

    getProviders(user.role, today, today)
      .then((data) => {
        const providers = data.providers || [];
        if (!providers.length) return;
        setProviderNotification({ message: `Proveedores que llegan hoy: ${providers.length}` });
        if (typeof window !== 'undefined') window.localStorage.setItem(notifiedKey, '1');
      })
      .catch(() => {
        // La notificación es opcional y no debe bloquear la vista.
      });
  }, [user]);

  async function handleLogin(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await login(username, password);
      setUsername('');
      setPassword('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    onNavigate('/');
    setMessage('');
    setProviderNotification(null);
  }

  if (!user) {
    return (
      <AuthContainer>
        <LoginCard
          username={username}
          password={password}
          loading={loading}
          message={message}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
        />
      </AuthContainer>
    );
  }

  return (
    <main className="dashboard-container">
      <AppSidebar activeSection={activeSection} user={user} onNavigate={onNavigate} onLogout={handleLogout}>
        <div className="brand">
          <img src="/logo.jpeg" alt="Mi Tesis" />
          <p>Panel administrativo</p>
        </div>

        <NavigationMenu activeSection={activeSection} user={user} onNavigate={onNavigate} />
      </AppSidebar>

      <section className="dashboard-content">
        <TopBar user={user} onLogout={handleLogout}>
          {message && <p className="status-message">{message}</p>}
        </TopBar>

        <ModuleRenderer activeSection={activeSection} user={user} />
      </section>

      {providerNotification && (
        <NotificationBanner message={providerNotification.message} onClose={() => setProviderNotification(null)} />
      )}
    </main>
  );
}
