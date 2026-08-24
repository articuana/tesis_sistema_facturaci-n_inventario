import ModalShell from '../common/ModalShell.jsx';
import { CUSTOMER_TYPES, FOOD_MENU } from '../../constants/forms.js';
import { normalizeCustomerName, normalizeSpaces } from '../../utils/validation.js';

export default function InvoiceModal({ billing }) {
  const { isModalOpen, setModalOpen, form, setForm, error, saving, customerFound, setCustomerFound, customerLookupMessage, setCustomerLookupMessage, lookupCustomer, addItem, updateItemQuantity, removeItem, save } = billing;
  if (!isModalOpen) return null;
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const total = form.items.reduce((sum, item) => sum + Number(item.quantity || 0) * item.unitPrice, 0) * 1.15;
  const setCustomerType = (type) => {
    setForm((current) => ({ ...current, customerType: type, customerIdentification: '', customerName: '', customerAddress: '', customerEmail: '', customerPhone: '' }));
    setCustomerFound(false); setCustomerLookupMessage('');
  };
  return <ModalShell title="Nueva factura local" onClose={() => setModalOpen(false)} className="invoice-modal-card"><form className="modal-form" onSubmit={save}>
    <label>Tipo de cliente<select value={form.customerType} onChange={(event) => setCustomerType(event.target.value)}><option value="consumidor_final">Consumidor Final</option><option value="cedula">Cédula</option><option value="ruc">RUC</option><option value="pasaporte">Pasaporte</option></select></label>
    {form.customerType === 'consumidor_final' ? <p className="fixed-price-help">Se registrará como Consumidor Final. No es necesario completar identificación, nombre, dirección, correo ni teléfono.</p> : <label>{CUSTOMER_TYPES[form.customerType].label}<input value={form.customerIdentification} onChange={(event) => { const value = form.customerType === 'pasaporte' ? event.target.value.toUpperCase().replace(/\s/g, '') : event.target.value.replace(/\D/g, ''); setForm((current) => ({ ...current, customerIdentification: value })); setCustomerFound(false); setCustomerLookupMessage(''); }} onBlur={lookupCustomer} placeholder={CUSTOMER_TYPES[form.customerType].placeholder} maxLength={CUSTOMER_TYPES[form.customerType].maxLength} inputMode={form.customerType === 'pasaporte' ? 'text' : 'numeric'} required /></label>}
    {customerLookupMessage && <p className="fixed-price-help">{customerLookupMessage}</p>}
    <label>Correo electrónico<input type="email" value={form.customerEmail} onChange={change('customerEmail')} onBlur={() => setForm((current) => ({ ...current, customerEmail: current.customerEmail.trim().toLowerCase() }))} maxLength={255} required /></label>
    {form.customerType !== 'consumidor_final' ? <>
      <label>Teléfono<input value={form.customerPhone} onChange={(event) => setForm((current) => ({ ...current, customerPhone: event.target.value.replace(/\D/g, '') }))} inputMode="numeric" minLength={7} maxLength={10} /></label>
      <label>Nombre y apellidos / Razón social<input value={form.customerName} onChange={change('customerName')} onBlur={() => setForm((current) => ({ ...current, customerName: current.customerType === 'ruc' ? normalizeSpaces(current.customerName) : normalizeCustomerName(current.customerName) }))} minLength={3} maxLength={100} required /></label>
      <label>Dirección<textarea value={form.customerAddress} onChange={change('customerAddress')} onBlur={() => setForm((current) => ({ ...current, customerAddress: normalizeSpaces(current.customerAddress) }))} maxLength={200} rows={2} required /></label>
    </> : null}
    <div className="invoice-line-form"><label>Comida<select value={form.mealType} onChange={(event) => setForm((current) => ({ ...current, mealType: event.target.value, customMealName: '', customMealPrice: '' }))}><option value="">Selecciona una comida</option><option value="almuerzo">Almuerzo — $3.00</option><option value="sopa">Sopa — $1.70</option><option value="segundo">Segundo — $2.00</option><option value="otro">Otro</option></select></label>
      {form.mealType === 'otro' && <><label>Nombre<input value={form.customMealName} onChange={change('customMealName')} maxLength={180} required /></label><label>Precio unitario<input type="text" value={form.customMealPrice} onChange={(event) => {
        const rawValue = event.target.value.replace(',', '.');
        if (/^(\d+(?:\.\d{0,2})?|\.\d{0,2})?$/.test(rawValue)) {
          setForm((current) => ({ ...current, customMealPrice: rawValue }));
        }
      }} placeholder="0.00" required /></label></>}
      <label>Cantidad<input type="number" min="1" step="1" value={form.quantity} onChange={change('quantity')} required /></label><button type="button" className="secondary-button add-line-button" onClick={addItem}>Agregar</button>
    </div>
    {form.mealType && form.mealType !== 'otro' && <p className="fixed-price-help">Precio fijo de {FOOD_MENU[form.mealType].label}: <strong>${FOOD_MENU[form.mealType].price.toFixed(2)}</strong></p>}
    {form.items.length > 0 && <div className="invoice-items">{form.items.map((item, index) => <div className="invoice-item" key={`${item.itemName}-${index}`}><span>{item.itemName}</span><label className="invoice-item-quantity">Cantidad<input type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItemQuantity(index, event.target.value)} /></label><strong>${(item.quantity * item.unitPrice).toFixed(2)}</strong><button type="button" className="mini-button danger" onClick={() => removeItem(index)}>Quitar</button></div>)}</div>}
    {error && <p className="status-message">{error}</p>}<div className="invoice-total-preview"><span>Total con IVA</span><strong>${total.toFixed(2)}</strong></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Enviando...' : 'Guardar factura'}</button></div>
  </form></ModalShell>;
}
