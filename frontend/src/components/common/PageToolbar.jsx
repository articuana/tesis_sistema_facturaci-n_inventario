export default function PageToolbar({ children, actions }) {
  return (
    <div className="toolbar-card">
      <div className="toolbar-content">{children}</div>
      {actions && <div className="toolbar-actions">{actions}</div>}
    </div>
  );
}
