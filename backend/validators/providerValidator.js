const validateProviderPayload = (payload) => {
  const company = String(payload.company || '').trim();
  const supplierName = String(payload.supplier_name || '').trim();
  const productType = String(payload.product_type || '').trim();
  const productTypeOther = String(payload.product_type_other || '').trim();
  const scheduledDay = String(payload.scheduled_day || '').trim();
  const phone = payload.contact_phone ? String(payload.contact_phone).trim() : '';
  const contactMode = String(payload.contact_mode || '').trim();

  if (!company || company.length > 100) throw new Error('Empresa es obligatoria y debe tener máximo 100 caracteres.');
  if (supplierName && supplierName.length > 100) throw new Error('Nombre del proveedor debe tener máximo 100 caracteres.');

  const allowedTypes = ['Carnes','dulces','Gaseosas','Frutas','Verduras','Otro'];
  if (!productType || !allowedTypes.includes(productType)) throw new Error('Tipo de productos inválido.');
  if (productType === 'Otro') {
    if (!productTypeOther || !/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{1,50}$/.test(productTypeOther)) {
      throw new Error('Si seleccionas "Otro", especifica el tipo (solo letras y espacios, máximo 50 caracteres).');
    }
  }

  const allowedDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  if (!allowedDays.includes(scheduledDay)) throw new Error('Selecciona un día de la semana entre lunes y sábado.');

  if (!['presencial','telefono'].includes(contactMode)) throw new Error('Modo de contacto inválido.');
  if (contactMode === 'telefono') {
    if (!phone || !/^\d{7,10}$/.test(phone)) throw new Error('El teléfono es obligatorio cuando el modo de contacto es telefónico.');
  } else if (phone && !/^\d{7,10}$/.test(phone)) {
    throw new Error('Teléfono inválido (7-10 dígitos).');
  }

  return {
    company,
    supplier_name: supplierName || null,
    product_type: productType,
    product_type_other: productType === 'Otro' ? productTypeOther : null,
    scheduled_day: scheduledDay,
    contact_phone: phone || null,
    contact_mode: contactMode,
  };
};

export { validateProviderPayload };
