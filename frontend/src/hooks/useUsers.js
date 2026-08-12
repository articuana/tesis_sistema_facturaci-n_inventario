import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_USER_FORM } from '../constants/forms.js';
import * as userService from '../services/userService.js';
import { useAuth } from './useAuth.js';

export function useUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(DEFAULT_USER_FORM);
  const [isModalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const loadUsers = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try { const data = await userService.getUsers(user.role); setUsers(data.users || []); } catch (error) { setMessage(error.message); }
  }, [user]);
  useEffect(() => { loadUsers(); }, [loadUsers]);
  const openCreate = () => { setMessage(''); setForm(DEFAULT_USER_FORM); setModalOpen(true); };
  const openEdit = (item) => {
    setMessage('');
    setForm({ id: item.id, username: item.username || '', firstName: item.first_name || '', lastName: item.last_name || '', email: item.email, identification: item.identification || '', password: '', confirmPassword: '', role: item.role, status: item.status || 'Activo', phone: item.phone || '', location: item.location || '' });
    setModalOpen(true);
  };
  const validate = () => {
    if (!/^[A-Za-z0-9_]{4,30}$/.test(form.username.trim())) throw new Error('El usuario debe tener letras, números o guion bajo, entre 4 y 30 caracteres.');
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,50}$/.test(form.firstName.trim()) || !/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,50}$/.test(form.lastName.trim())) throw new Error('Nombres y apellidos deben tener entre 2 y 50 letras y espacios.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) throw new Error('El correo electrónico no es válido.');
    if (!/^\d{10}$/.test(form.identification.trim())) throw new Error('La identificación debe contener exactamente 10 números.');
    if (!form.id && (form.password.length < 8 || form.password !== form.confirmPassword)) throw new Error('La contraseña debe tener al menos 8 caracteres y coincidir con su confirmación.');
    if (form.phone && !/^\d{10}$/.test(form.phone)) throw new Error('El teléfono debe contener exactamente 10 números.');
    if (form.location && !/^[A-Za-z0-9ÁÉÍÓÚÑáéíóúñ ]{1,50}$/.test(form.location.trim())) throw new Error('La dirección debe contener solo letras, números y espacios, máximo 50 caracteres.');
  };
  const save = async (event) => {
    event.preventDefault(); setMessage('');
    try {
      validate();
      const payload = form.id ? { ...form, password: undefined, confirmPassword: undefined } : form;
      await userService.saveUser(payload, user.role);
      setModalOpen(false); setForm(DEFAULT_USER_FORM); await loadUsers();
    } catch (error) { setMessage(error.message); }
  };
  const remove = async (id) => {
    if (id === user?.id) { setMessage('No puedes eliminar tu propio usuario.'); return; }
    const target = users.find((item) => item.id === id);
    if (target?.role === 'admin') { setMessage('No puedes eliminar a un usuario administrador.'); return; }
    try { await userService.deleteUser(id, user.role); await loadUsers(); } catch (error) { setMessage(error.message); }
  };
  return { users, form, setForm, isModalOpen, setModalOpen, message, openCreate, openEdit, save, remove };
}
