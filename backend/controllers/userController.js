import { getUsers, createUser, updateUser, deactivateUser } from '../services/userService.js';
import { validateUserPayload } from '../validators/userValidator.js';

const listUsers = async (req, res) => {
  try {
    const users = await getUsers();
    res.json({ users });
  } catch (error) {
    console.error('Error en GET /api/users:', error);
    res.status(500).json({ error: 'No se pudieron obtener los usuarios.' });
  }
};

const createUserHandler = async (req, res) => {
  const { username, firstName, lastName, email, identification, password, confirmPassword, role, phone, location, status } = req.body;

  if (!username || !firstName || !lastName || !email || !identification || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
  }

  if (!['admin', 'facturador'].includes(role)) {
    return res.status(400).json({ error: 'El rol debe ser admin o facturador.' });
  }

  try {
    validateUserPayload({ username, firstName, lastName, email, identification, password, confirmPassword, phone, location }, {
      requirePassword: true,
      requireUsername: true,
      requireIdentification: true,
      requireConfirmPassword: true,
    });

    const user = await createUser({ username, firstName, lastName, email, identification, password, confirmPassword, role, phone, location, status });
    return res.status(201).json({ user });
  } catch (error) {
    console.error('Error en POST /api/users:', error);
    if (error.message.includes('registrado')) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudo crear el usuario.' });
  }
};

const updateUserHandler = async (req, res) => {
  const { id } = req.params;
  const { username, firstName, lastName, email, identification, role, phone, location, status } = req.body;

  if (!['admin', 'facturador'].includes(role)) {
    return res.status(400).json({ error: 'El rol debe ser admin o facturador.' });
  }

  try {
    validateUserPayload({ username, firstName, lastName, email, identification, phone, location }, {
      requireUsername: true,
      requireIdentification: true,
    });

    const user = await updateUser({ id, username, firstName, lastName, email, identification, role, phone, location, status });
    return res.json({ user });
  } catch (error) {
    console.error('Error en PUT /api/users/:id:', error);
    if (error.message.includes('registrado')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('Usuario no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudo actualizar el usuario.' });
  }
};

const deleteUserHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deactivateUser(id);
    return res.json(result);
  } catch (error) {
    console.error('Error en DELETE /api/users/:id:', error);
    if (error.message.includes('Usuario no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudo eliminar el usuario.' });
  }
};

export { listUsers, createUserHandler, updateUserHandler, deleteUserHandler };
