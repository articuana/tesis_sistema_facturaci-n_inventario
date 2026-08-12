import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_INVOICE_FORM, FOOD_MENU } from '../constants/forms.js';
import * as invoiceService from '../services/invoiceService.js';
import { getContactValidationError, getCustomerDetailsValidationError, getCustomerValidationError, normalizeCustomerName, normalizeSpaces } from '../utils/validation.js';
import { useAuth } from './useAuth.js';

export function useBilling() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(DEFAULT_INVOICE_FORM);
  const [isModalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [customerFound, setCustomerFound] = useState(false);
  const [customerLookupMessage, setCustomerLookupMessage] = useState('');
  const [message, setMessage] = useState('');
  const loadInvoices = useCallback(async () => {
    if (!user) return;
    try { const data = await invoiceService.getInvoices(user.role); setInvoices(data.invoices || []); } catch (requestError) { setMessage(requestError.message); }
  }, [user]);
  useEffect(() => { loadInvoices(); }, [loadInvoices]);
  const openCreate = () => { setForm(DEFAULT_INVOICE_FORM); setError(''); setCustomerFound(false); setCustomerLookupMessage(''); setModalOpen(true); };
  const addItem = (event) => {
    event.preventDefault(); setError('');
    const selected = FOOD_MENU[form.mealType];
    const quantity = Number(form.quantity);
    const isCustom = form.mealType === 'otro';
    const itemName = isCustom ? form.customMealName.trim() : selected?.label;
    const unitPrice = isCustom ? Number(form.customMealPrice) : selected?.price;
    if (!selected) return setError('Selecciona el tipo de comida.');
    if (!Number.isInteger(quantity) || quantity < 1) return setError('La cantidad debe ser un número entero mayor que cero.');
    if (!itemName) return setError('Ingresa el nombre de la comida.');
    if (!Number.isFinite(unitPrice) || unitPrice < 0) return setError('Ingresa un precio válido.');
    setForm((current) => ({ ...current, mealType: '', customMealName: '', quantity: 1, customMealPrice: '', items: [...current.items, { itemType: current.mealType, itemName, quantity, unitPrice }] }));
  };
  const updateItemQuantity = (index, value) => {
    const quantity = Number(value);
    if (value !== '' && (!Number.isInteger(quantity) || quantity < 1)) return;
    setForm((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: value === '' ? '' : quantity } : item) }));
  };
  const removeItem = (index) => setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }));
  const lookupCustomer = async () => {
    const type = form.customerType;
    const identification = form.customerIdentification.trim().toUpperCase();
    if (type === 'consumidor_final' || getCustomerValidationError(type, identification)) return;
    try {
      const data = await invoiceService.lookupCustomer(type, identification, user.role);
      if (!data.customer) { setCustomerFound(false); setCustomerLookupMessage('Cliente nuevo: completa sus datos para registrarlo con la factura.'); return; }
      setForm((current) => ({ ...current, customerName: data.customer.name, customerAddress: data.customer.address, customerEmail: data.customer.email, customerPhone: data.customer.phone }));
      setCustomerFound(true); setCustomerLookupMessage('Cliente existente: sus datos fueron cargados.');
    } catch { setCustomerFound(false); setCustomerLookupMessage('No se pudo consultar el cliente. Inténtalo nuevamente.'); }
  };
  const save = async (event) => {
    event.preventDefault(); setError('');
    if (!form.items.length) return setError('Agrega al menos una comida a la factura.');
    if (form.items.some((item) => !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)) return setError('Cada comida debe tener una cantidad entera mayor que cero.');
    const customerError = getCustomerValidationError(form.customerType, form.customerIdentification);
    if (customerError) return setError(customerError);
    const detailsError = getCustomerDetailsValidationError(form.customerType, form.customerName, form.customerAddress);
    if (detailsError) return setError(detailsError);
    const contactError = getContactValidationError(form.customerType, form.customerEmail, form.customerPhone);
    if (contactError) return setError(contactError);
    try {
      await invoiceService.saveInvoice({
        customerType: form.customerType,
        customerIdentification: form.customerType === 'consumidor_final' ? '9999999999999' : form.customerIdentification,
        customerName: form.customerType === 'ruc' ? normalizeSpaces(form.customerName) : normalizeCustomerName(form.customerName),
        customerAddress: normalizeSpaces(form.customerAddress),
        customerEmail: form.customerEmail.trim().toLowerCase(),
        customerPhone: form.customerPhone.trim(),
        items: form.items,
      }, user.role);
      setForm(DEFAULT_INVOICE_FORM); setCustomerFound(false); setCustomerLookupMessage(''); setModalOpen(false); await loadInvoices(); setMessage('Factura creada correctamente.');
    } catch (requestError) { setError(requestError.message); }
  };
  const remove = async (id) => {
    if (!window.confirm('¿Ocultar esta factura de la vista?')) return;
    try { await invoiceService.deleteInvoice(id, user.role); await loadInvoices(); setMessage('Factura oculta correctamente.'); } catch (requestError) { setMessage(requestError.message); }
  };

  const downloadInvoice = async (id, invoiceNumber) => {
    try {
      const blob = await invoiceService.downloadInvoicePdf(id, user.role);
      const fileName = `factura-${invoiceNumber || id}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  return { invoices, form, setForm, isModalOpen, setModalOpen, error, message, customerFound, setCustomerFound, customerLookupMessage, setCustomerLookupMessage, openCreate, addItem, updateItemQuantity, removeItem, lookupCustomer, save, remove, downloadInvoice };
}
