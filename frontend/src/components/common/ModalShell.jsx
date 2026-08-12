export default function ModalShell({ title, onClose, children, className = '' }) {
  return (
    <div className="modal-overlay">
      <div className={`modal-card ${className}`.trim()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
