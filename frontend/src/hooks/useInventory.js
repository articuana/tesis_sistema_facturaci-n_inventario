import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_INVENTORY_FILTERS, DEFAULT_PRODUCT_FORM, PRODUCT_TYPES } from '../constants/forms.js';
import * as inventoryService from '../services/inventoryService.js';
import { useAuth } from './useAuth.js';

const RESET_INTERVAL = 14 * 24 * 60 * 60 * 1000;

export function useInventory() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_INVENTORY_FILTERS);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(DEFAULT_PRODUCT_FORM);
  const [isModalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async () => {
    if (!user) return;
    if (filters.dateTo && filters.dateTo > new Date().toISOString().slice(0, 10)) {
      setError('La fecha límite no puede superar la fecha actual.');
      return;
    }
    try {
      const data = await inventoryService.getProducts(filters, user.role);
      setProducts(data.products || []);
    } catch (requestError) { setError(requestError.message); }
  }, [filters, user]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => {
    if (!user) return;
    try {
      const previous = Number(window.localStorage.getItem('tesis-inventory-last-reset'));
      if (!previous || Date.now() - previous >= RESET_INTERVAL) {
        window.localStorage.setItem('tesis-inventory-last-reset', String(Date.now()));
        setFilters(DEFAULT_INVENTORY_FILTERS);
        setForm(DEFAULT_PRODUCT_FORM);
      }
    } catch { /* almacenamiento no disponible */ }
  }, [user]);

  const openCreate = () => { setError(''); setForm(DEFAULT_PRODUCT_FORM); setModalOpen(true); };
  const openEdit = (product) => { setError(''); setForm({ ...product, productType: product.productType || 'Bebidas' }); setModalOpen(true); };
  const save = async (event) => {
    event.preventDefault();
    if (!PRODUCT_TYPES.includes(form.productType)) { setError('Selecciona un tipo de producto válido.'); return; }
    try {
      await inventoryService.saveProduct(form, user.role);
      setModalOpen(false); setForm(DEFAULT_PRODUCT_FORM); await loadProducts();
    } catch (requestError) { setError(requestError.message); }
  };
  const remove = async (id) => {
    try { await inventoryService.deleteProduct(id, user.role); await loadProducts(); } catch (requestError) { setError(requestError.message); }
  };

  return { filters, setFilters, products, form, setForm, isModalOpen, setModalOpen, error, openCreate, openEdit, save, remove };
}
