const namePattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,50}$/;
const usernamePattern = /^[A-Za-z0-9_]{4,30}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;
const addressPattern = /^[A-Za-z0-9ÁÉÍÓÚÑáéíóúñ ]{1,50}$/;
const passwordPattern = /^.{8,}$/;
const identificationPattern = /^\d{10}$/;

function isValidCedula(identification) {
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
}

const isValidUserIdentification = (value) => {
  const identification = String(value || '').trim();
  return identificationPattern.test(identification) && isValidCedula(identification);
};

const validateUserPayload = (payload, {
  requirePassword = false,
  requireUsername = false,
  requireIdentification = false,
  requireConfirmPassword = false,
  confirmPassword = undefined,
} = {}) => {
  const firstName = String(payload.firstName || '').trim();
  const lastName = String(payload.lastName || '').trim();
  const username = String(payload.username || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const identification = String(payload.identification || '').trim();
  const password = String(payload.password || '');
  const confirm = String(confirmPassword || payload.confirmPassword || '').trim();

  if (!namePattern.test(firstName)) {
    throw new Error('El nombre debe contener solo letras y espacios, entre 2 y 50 caracteres.');
  }

  if (!namePattern.test(lastName)) {
    throw new Error('El apellido debe contener solo letras y espacios, entre 2 y 50 caracteres.');
  }

  if (requireUsername && !usernamePattern.test(username)) {
    throw new Error('El usuario debe tener letras, números o guion bajo, entre 4 y 30 caracteres.');
  }

  if (!emailPattern.test(email) || email.length > 100) {
    throw new Error('El correo electrónico no tiene formato válido o supera los 100 caracteres.');
  }

  if (requireIdentification && !isValidUserIdentification(identification)) {
    throw new Error('La identificación debe ser una cédula ecuatoriana válida de 10 dígitos.');
  }

  if (requirePassword && !passwordPattern.test(password)) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.');
  }

  if (requireConfirmPassword && password !== confirm) {
    throw new Error('La confirmación de contraseña debe coincidir con la contraseña.');
  }

  if (payload.phone !== undefined && payload.phone !== '' && !phonePattern.test(String(payload.phone).trim())) {
    throw new Error('El teléfono debe contener exactamente 10 números.');
  }

  if (payload.location !== undefined && payload.location !== '' && !addressPattern.test(String(payload.location).trim())) {
    throw new Error('La dirección debe contener solo letras, números y espacios, máximo 50 caracteres.');
  }
};

export { isValidCedula, isValidUserIdentification, validateUserPayload };
