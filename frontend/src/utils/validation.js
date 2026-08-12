export const normalizeSpaces = (value) => String(value || '').trim().replace(/\s+/g, ' ');

export function normalizeCustomerName(value) {
  return normalizeSpaces(value).toLocaleLowerCase('es-EC').replace(/(^|[ '\-])([a-záéíóúüñ])/g, (match, prefix, letter) => `${prefix}${letter.toLocaleUpperCase('es-EC')}`);
}

export function isValidCedula(identification) {
  if (!/^\d{10}$/.test(identification)) return false;
  const province = Number(identification.slice(0, 2));
  if (province < 1 || province > 24 || Number(identification[2]) > 5) return false;
  const total = identification.slice(0, 9).split('').reduce((sum, digit, index) => {
    let value = Number(digit) * (index % 2 === 0 ? 2 : 1);
    if (value > 9) value -= 9;
    return sum + value;
  }, 0);
  return (10 - (total % 10)) % 10 === Number(identification[9]);
}

export function isValidRuc(identification) {
  if (!/^\d{13}$/.test(identification) || !identification.endsWith('001')) return false;
  const province = Number(identification.slice(0, 2));
  const thirdDigit = Number(identification[2]);
  if (province < 1 || province > 24) return false;
  if (thirdDigit <= 5) return isValidCedula(identification.slice(0, 10));
  const validate = (weights, position, replacement) => {
    const total = weights.reduce((sum, weight, index) => sum + Number(identification[index]) * weight, 0);
    let verifier = 11 - (total % 11);
    if (verifier === 11) verifier = 0;
    if (verifier === 10) verifier = replacement;
    return verifier === Number(identification[position]);
  };
  if (thirdDigit === 6) return validate([3, 2, 7, 6, 5, 4, 3, 2], 8, -1);
  if (thirdDigit === 9) return validate([4, 3, 2, 7, 6, 5, 4, 3, 2], 9, 1);
  return false;
}

export function getCustomerValidationError(type, rawIdentification) {
  const identification = String(rawIdentification || '').trim().toUpperCase();
  if (type === 'consumidor_final') return '';
  if (type === 'cedula' && !isValidCedula(identification)) return 'Ingresa una cédula ecuatoriana válida de 10 dígitos.';
  if (type === 'ruc' && !isValidRuc(identification)) return 'Ingresa un RUC ecuatoriano válido de 13 dígitos.';
  if (type === 'pasaporte' && !/^[A-Z0-9]{5,20}$/.test(identification)) return 'El pasaporte debe tener de 5 a 20 letras o números, sin espacios.';
  return '';
}

export function getCustomerDetailsValidationError(type, name, address) {
  if (type === 'consumidor_final') return '';
  const normalizedName = normalizeSpaces(name);
  const normalizedAddress = normalizeSpaces(address);
  if (normalizedName.length < 3 || normalizedName.length > 100 || !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(normalizedName)) return 'El nombre o razón social debe tener entre 3 y 100 letras, espacios, tildes, Ñ, apóstrofes o guiones.';
  if (normalizedAddress.length < 5 || normalizedAddress.length > 200 || !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ,.#/\-]+$/.test(normalizedAddress)) return 'La dirección debe tener entre 5 y 200 caracteres válidos.';
  return '';
}

export function getContactValidationError(type, emailValue, phoneValue) {
  const email = String(emailValue || '').trim();
  const phone = String(phoneValue || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) return 'Ingresa un correo electrónico válido.';
  if (type !== 'consumidor_final' && !/^\d{7,10}$/.test(phone)) return 'El teléfono debe contener solo números, entre 7 y 10 dígitos.';
  return '';
}
