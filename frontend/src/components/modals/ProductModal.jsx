import ModalShell from '../common/ModalShell.jsx';
import { PRODUCT_TYPES } from '../../constants/forms.js';

const sanitizeProductText = (value, maxLength = 100) => String(value || '').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]/g, '').slice(0, maxLength);

export default function ProductModal({ inventory }) {
  const { isModalOpen, setModalOpen, form, setForm, error, save } = inventory;
  if (!isModalOpen) return null;
  return <ModalShell title={form.id ? 'Editar producto' : 'Crear producto'} onClose={() => setModalOpen(false)}><form className="modal-form" onSubmit={save}>
    <label>Nombre<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: sanitizeProductText(event.target.value, 100) }))} required maxLength={100} pattern="[A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]{1,100}" /></label>
    <label>Cantidad<input type="number" min="0" max="99" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value.slice(0, 2) }))} required /></label>
    <label>Tipo<select value={form.productType} onChange={(event) => setForm((current) => ({ ...current, productType: event.target.value }))}>{PRODUCT_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
    <label>Marca<input value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: sanitizeProductText(event.target.value, 50) }))} maxLength={50} pattern="[A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]{0,50}" /></label>
    {error && <p className="status-message">{error}</p>}
    <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="primary-button">Guardar</button></div>
  </form></ModalShell>;
}
