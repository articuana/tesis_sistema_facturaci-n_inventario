import ModalShell from '../common/ModalShell.jsx';

export default function ProviderModal({ providers }) {
  const { isModalOpen, setModalOpen, form, setForm, message, save } = providers;
  if (!isModalOpen) return null;
  return <ModalShell title={form.id ? 'Editar proveedor' : 'Crear proveedor'} onClose={() => setModalOpen(false)}><form className="modal-form" onSubmit={save}>
    <label>Empresa<input value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} required maxLength={100} /></label>
    <label>Nombre proveedor (opcional)<input value={form.supplier_name} onChange={(event) => setForm((current) => ({ ...current, supplier_name: event.target.value }))} maxLength={100} /></label>
    <label>Tipo de productos<select value={form.product_type} onChange={(event) => setForm((current) => ({ ...current, product_type: event.target.value }))}><option>Carnes</option><option>dulces</option><option>Gaseosas</option><option>Frutas</option><option>Verduras</option><option>Otro</option></select></label>
    {form.product_type === 'Otro' && <label>Especifique tipo<input value={form.product_type_other} onChange={(event) => setForm((current) => ({ ...current, product_type_other: event.target.value }))} maxLength={50} /></label>}
    <label>Día programado<select value={form.scheduled_day} onChange={(event) => setForm((current) => ({ ...current, scheduled_day: event.target.value }))} required>
      <option>Lunes</option>
      <option>Martes</option>
      <option>Miércoles</option>
      <option>Jueves</option>
      <option>Viernes</option>
      <option>Sábado</option>
    </select></label>
    <label>Modo de contacto<select value={form.contact_mode} onChange={(event) => setForm((current) => ({ ...current, contact_mode: event.target.value }))}><option value="presencial">Presencial</option><option value="telefono">Contacto Telefónico</option></select></label>
    <label>Teléfono<input value={form.contact_phone} onChange={(event) => setForm((current) => ({ ...current, contact_phone: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" maxLength={15} required={form.contact_mode === 'telefono'} /></label>
    {message && <p className="status-message">{message}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="primary-button">Guardar</button></div>
  </form></ModalShell>;
}
