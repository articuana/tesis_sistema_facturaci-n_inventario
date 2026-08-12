const CONSUMIDOR_FINAL_IDENTIFICATION = '9999999999999';

const isValidCedula = (identification) => {
  if (!/^\d{10}$/.test(identification)) return false;

  const province = Number(identification.slice(0, 2));
  const thirdDigit = Number(identification[2]);
  if (province < 1 || province > 24 || thirdDigit > 5) return false;

  const digits = identification.split('').map(Number);
  const total = digits.slice(0, 9).reduce((sum, digit, index) => {
    let value = digit * (index % 2 === 0 ? 2 : 1);
    if (value > 9) value -= 9;
    return sum + value;
  }, 0);

  const checkDigit = (10 - (total % 10)) % 10;
  return checkDigit === digits[9];
};

const isValidRuc = (identification) => {
  if (!/^\d{13}$/.test(identification) || !identification.endsWith('001')) return false;

  const province = Number(identification.slice(0, 2));
  const thirdDigit = Number(identification[2]);
  if (province < 1 || province > 24) return false;

  if (thirdDigit <= 5) return isValidCedula(identification.slice(0, 10));

  const validateCheckDigit = (weights, checkPosition, tenValue) => {
    const total = weights.reduce((sum, weight, index) => sum + Number(identification[index]) * weight, 0);
    let verifier = 11 - (total % 11);
    if (verifier === 11) verifier = 0;
    if (verifier === 10) verifier = tenValue;
    return verifier === Number(identification[checkPosition]);
  };

  if (thirdDigit === 6) return validateCheckDigit([3, 2, 7, 6, 5, 4, 3, 2], 8, -1);
  if (thirdDigit === 9) return validateCheckDigit([4, 3, 2, 7, 6, 5, 4, 3, 2], 9, 1);
  return false;
};

const normalizeCustomerIdentification = (customerType, customerIdentification) => {
  if (customerType === 'consumidor_final') return CONSUMIDOR_FINAL_IDENTIFICATION;

  const identification = String(customerIdentification || '').trim().toUpperCase();
  const isValid = (
    (customerType === 'cedula' && isValidCedula(identification))
    || (customerType === 'ruc' && isValidRuc(identification))
    || (customerType === 'pasaporte' && /^[A-Z0-9]{5,20}$/.test(identification))
  );

  if (!isValid) {
    throw new Error('La identificación del cliente no es válida para el tipo seleccionado.');
  }

  return identification;
};

const normalizeCustomer = ({ customerType, customerIdentification, customerName, customerAddress, customerEmail, customerPhone }) => {
  const normalizedName = customerType === 'ruc'
    ? String(customerName || '').trim().replace(/\s+/g, ' ')
    : String(customerName || '').trim().toLocaleLowerCase('es-EC').replace(/(^|[ '\-])([a-záéíóúüñ])/g, (match, prefix, letter) => `${prefix}${letter.toLocaleUpperCase('es-EC')}`);
  const normalizedAddress = String(customerAddress || '').trim().replace(/\s+/g, ' ');
  const normalizedEmail = String(customerEmail || '').trim().toLowerCase();
  const normalizedPhone = String(customerPhone || '').trim();

  if (customerType === 'consumidor_final') {
    return {
      customerType,
      customerIdentification: CONSUMIDOR_FINAL_IDENTIFICATION,
      customerName: normalizedName || 'CONSUMIDOR FINAL',
      customerAddress: normalizedAddress || '',
      customerEmail: normalizedEmail || '',
      customerPhone: normalizedPhone || '',
    };
  }

  if (normalizedName.length < 3 || normalizedName.length > 100 || !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(normalizedName)) {
    throw new Error('El nombre o razón social debe tener entre 3 y 100 letras, espacios, tildes, Ñ, apóstrofes o guiones.');
  }
  if (normalizedAddress.length < 5 || normalizedAddress.length > 200 || !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ,.#/\-]+$/.test(normalizedAddress)) {
    throw new Error('La dirección debe tener entre 5 y 200 caracteres y solo puede incluir letras, números, espacios, comas, puntos, guiones, # o /.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 255) {
    throw new Error('El correo electrónico no tiene un formato válido.');
  }
  if (!/^\d{7,10}$/.test(normalizedPhone)) {
    throw new Error('El teléfono debe contener solo números, entre 7 y 10 dígitos.');
  }

  return {
    customerType,
    customerIdentification: normalizeCustomerIdentification(customerType, customerIdentification),
    customerName: normalizedName,
    customerAddress: normalizedAddress,
    customerEmail: normalizedEmail,
    customerPhone: normalizedPhone,
  };
};

export { normalizeCustomer, normalizeCustomerIdentification };
