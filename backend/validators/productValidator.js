const validateProductPayload = (payload) => {
  const name = String(payload.name || '').trim();
  const quantity = Number(payload.quantity);
  const code = payload.code === null || payload.code === undefined ? null : String(payload.code).trim();
  const productType = String(payload.productType || payload.product_type || '').trim();
  const brand = payload.brand === undefined ? '' : String(payload.brand || '').trim();
  const allowedProductTypes = ['Bebidas', 'Desechables', 'Productos de limpieza', 'Empacados'];

  if (!name || name.length > 100 || !/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]{1,100}$/.test(name)) {
    throw new Error('El nombre del producto debe tener entre 1 y 100 caracteres, solo letras, números y espacios.');
  }
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) throw new Error('La cantidad debe ser un entero entre 0 y 99.');
  if (code !== null && code !== '' && !/^\d{13}$/.test(code)) throw new Error('El código debe tener exactamente 13 dígitos si se proporciona.');
  if (!productType || !allowedProductTypes.includes(productType)) throw new Error('Tipo de producto inválido.');
  if (brand && (brand.length > 50 || !/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]{1,50}$/.test(brand))) {
    throw new Error('La marca debe tener máximo 50 caracteres y no incluir símbolos.');
  }
};

export { validateProductPayload };
