export default function NotificationBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, background: '#0b74ff', color: '#fff', padding: 12, borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ fontWeight: 700 }}>Notificación</div>
      <div style={{ fontSize: 13 }}>{message}</div>
      <div style={{ marginTop: 8, textAlign: 'right' }}>
        <button style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: 4 }} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
