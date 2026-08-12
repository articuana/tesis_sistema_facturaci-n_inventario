import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PROVIDER_FORM } from '../constants/forms.js';
import * as providerService from '../services/providerService.js';
import { useAuth } from './useAuth.js';

const PROVIDER_TYPES = ['Carnes', 'dulces', 'Gaseosas', 'Frutas', 'Verduras', 'Otro'];
const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function useProviders() {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState(DEFAULT_PROVIDER_FORM);
  const [isModalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const loadProviders = useCallback(async () => {
    if (!user) return;
    try { const data = await providerService.getProviders(user.role); setProviders(data.providers || []); } catch (error) { setMessage(error.message); }
  }, [user]);
  useEffect(() => { loadProviders(); }, [loadProviders]);
  const openCreate = () => { setMessage(''); setForm(DEFAULT_PROVIDER_FORM); setModalOpen(true); };
  const openEdit = (provider) => {
    setMessage('');
    setForm({ id: provider.id, company: provider.company, supplier_name: provider.supplier_name || '', product_type: provider.product_type, product_type_other: provider.product_type_other || '', scheduled_day: provider.scheduled_day || 'Lunes', contact_phone: provider.contact_phone || '', contact_mode: provider.contact_mode || 'presencial' });
    setModalOpen(true);
  };
  const validate = () => {
    if (!form.company.trim() || form.company.trim().length > 100) throw new Error('Empresa es obligatoria y debe tener máximo 100 caracteres.');
    if (form.supplier_name.trim().length > 100) throw new Error('Nombre del proveedor debe tener máximo 100 caracteres.');
    if (!PROVIDER_TYPES.includes(form.product_type)) throw new Error('Tipo de productos inválido.');
    if (form.product_type === 'Otro' && !/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{1,50}$/.test(form.product_type_other.trim())) throw new Error('Especifica el tipo de producto (solo letras y espacios).');
    if (!WEEKDAYS.includes(form.scheduled_day)) throw new Error('Selecciona un día de la semana entre lunes y sábado.');
    if (!['presencial', 'telefono'].includes(form.contact_mode)) throw new Error('Modo de contacto inválido.');
    if (form.contact_mode === 'telefono') {
      if (!form.contact_phone || !/^\d{7,15}$/.test(form.contact_phone)) throw new Error('El teléfono es obligatorio cuando el modo de contacto es telefónico.');
    } else if (form.contact_phone && !/^\d{7,15}$/.test(form.contact_phone)) {
      throw new Error('Teléfono inválido (7-15 dígitos).');
    }
  };
  const save = async (event) => {
    event.preventDefault(); setMessage('');
    try { validate(); await providerService.saveProvider(form, user.role); setModalOpen(false); setForm(DEFAULT_PROVIDER_FORM); await loadProviders(); } catch (error) { setMessage(error.message); }
  };
  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try { await providerService.deleteProvider(id, user.role); await loadProviders(); } catch (error) { setMessage(error.message); }
  };
  return { providers, form, setForm, isModalOpen, setModalOpen, message, openCreate, openEdit, save, remove };
}
