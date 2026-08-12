import { registerUser, loginUser } from '../services/authService.js';
import { validateUserPayload } from '../validators/userValidator.js';

const register = async (req, res) => {
  const { username, firstName, lastName, email, identification, password } = req.body;

  if (!username || !firstName || !lastName || !email || !identification || !password) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
  }

  try {
    validateUserPayload({ username, firstName, lastName, email, identification, password }, {
      requirePassword: true,
      requireUsername: true,
      requireIdentification: true,
      requireConfirmPassword: false,
    });

    const result = await registerUser({ username, firstName, lastName, email, identification, password });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error en /api/register:', error);
    if (error.message.includes('registrado')) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Error al crear el usuario.' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'El usuario y la contraseña son obligatorios.' });
  }

  try {
    const result = await loginUser({ username, password });
    return res.json(result);
  } catch (error) {
    console.error('Error en /api/login:', error);
    return res.status(401).json({ error: error.message });
  }
};

export { register, login };
