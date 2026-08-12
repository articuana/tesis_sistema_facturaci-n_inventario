export const PRODUCT_TYPES = ['Bebidas', 'Desechables', 'Productos de limpieza', 'Empacados'];

export const DEFAULT_PRODUCT_FORM = { id: null, name: '', quantity: '', productType: 'Bebidas', brand: '' };
export const DEFAULT_USER_FORM = {
  id: null, username: '', firstName: '', lastName: '', email: '', identification: '', password: '', confirmPassword: '', role: 'facturador', status: 'Activo', phone: '', location: '',
};
export const DEFAULT_PROVIDER_FORM = {
  id: null, company: '', supplier_name: '', product_type: 'Carnes', product_type_other: '', scheduled_day: 'Lunes', contact_phone: '', contact_mode: 'presencial',
};
export const DEFAULT_INVOICE_FORM = {
  customerType: 'consumidor_final', customerIdentification: '', customerName: '', customerAddress: '', customerEmail: '', customerPhone: '', mealType: '', customMealName: '', quantity: 1, customMealPrice: '', items: [],
};
export const DEFAULT_INVENTORY_FILTERS = { name: '', dateFrom: '', dateTo: '', quantity: '' };

export const FOOD_MENU = {
  almuerzo: { label: 'Almuerzo', price: 3 },
  sopa: { label: 'Sopa', price: 1.7 },
  segundo: { label: 'Segundo', price: 2 },
  otro: { label: 'Otro' },
};

export const CUSTOMER_TYPES = {
  consumidor_final: { label: 'Consumidor Final' },
  cedula: { label: 'Cédula', placeholder: '0000000000', maxLength: 10 },
  ruc: { label: 'RUC', placeholder: '0000000000000', maxLength: 13 },
  pasaporte: { label: 'Pasaporte', placeholder: 'ABC12345', maxLength: 20 },
};
