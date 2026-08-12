export default function PagePanel({ title, description, message, children, className = '' }) {
  return (
    <section className={`view-panel ${className}`.trim()}>
      <div className="panel-title">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>

      {message && <p className="status-message">{message}</p>}
      {children}
    </section>
  );
}
