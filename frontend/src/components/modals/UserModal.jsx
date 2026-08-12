import ModalShell from '../common/ModalShell.jsx';

const sanitizeLetters = (value, maxLength = 50) => String(value || '').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, '').slice(0, maxLength);
const sanitizeUsername = (value, maxLength = 30) => String(value || '').replace(/[^A-Za-z0-9_]/g, '').slice(0, maxLength);
const sanitizeDigits = (value, maxLength = 10) => String(value || '').replace(/\D/g, '').slice(0, maxLength);
const sanitizeLocation = (value, maxLength = 50) => String(value || '').replace(/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/g, '').slice(0, maxLength);

export default function UserModal({ users }) {
  const { isModalOpen, setModalOpen, form, setForm, message, save } = users;
  if (!isModalOpen) return null;
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  return <ModalShell title={form.id ? 'Editar usuario' : 'Crear usuario'} onClose={() => setModalOpen(false)}><form className="modal-form" onSubmit={save}>
    <label>Usuario<input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: sanitizeUsername(event.target.value) }))} required maxLength={30} pattern="[A-Za-z0-9_]{4,30}" /></label>
    <label>Nombres<input value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: sanitizeLetters(event.target.value, 50) }))} required maxLength={50} pattern="[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,50}" /></label>
    <label>Apellidos<input value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: sanitizeLetters(event.target.value, 50) }))} required maxLength={50} pattern="[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,50}" /></label>
    <label>Correo<input type="email" value={form.email} onChange={change('email')} required maxLength={100} /></label>
    <label>Identificación<input value={form.identification} onChange={(event) => setForm((current) => ({ ...current, identification: sanitizeDigits(event.target.value, 10) }))} required maxLength={10} inputMode="numeric" pattern="[0-9]{10}" /></label>
    {!form.id && <><label>Contraseña<input type="password" value={form.password} onChange={change('password')} required minLength={8} maxLength={72} /></label><label>Confirmar contraseña<input type="password" value={form.confirmPassword} onChange={change('confirmPassword')} required minLength={8} maxLength={72} /></label></>}
    <label>Rol<select value={form.role} onChange={change('role')}><option value="facturador">Facturador</option><option value="admin">Administrador</option></select></label>
    <label>Estado<select value={form.status} onChange={change('status')}><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></label>
    <label>Teléfono<input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: sanitizeDigits(event.target.value, 10) }))} inputMode="numeric" maxLength={10} pattern="[0-9]{10}" /></label>
    <label>Dirección<input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: sanitizeLocation(event.target.value, 50) }))} maxLength={50} pattern="[A-Za-z0-9ÁÉÍÓÚÑáéíóúñ ]{1,50}" /></label>
    {message && <p className="status-message">{message}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="primary-button">Guardar</button></div>
  </form></ModalShell>;
}
