import { getProviders, createProvider, updateProvider, deleteProvider } from '../services/providerService.js';

const listProviders = async (req, res) => {
  try {
    const providers = await getProviders(req.query);
    return res.json({ providers });
  } catch (error) {
    console.error('Error en GET /api/providers:', error);
    return res.status(500).json({ error: 'No se pudieron obtener los proveedores.' });
  }
};

const createProviderHandler = async (req, res) => {
  try {
    const provider = await createProvider(req.body);
    return res.status(201).json({ provider });
  } catch (error) {
    console.error('Error en POST /api/providers:', error);
    return res.status(400).json({ error: error.message || 'No se pudo crear el proveedor.' });
  }
};

const updateProviderHandler = async (req, res) => {
  try {
    const provider = await updateProvider(req.params.id, req.body);
    return res.json({ provider });
  } catch (error) {
    console.error('Error en PUT /api/providers/:id:', error);
    if (error.message.includes('Proveedor no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message || 'No se pudo actualizar el proveedor.' });
  }
};

const deleteProviderHandler = async (req, res) => {
  try {
    const result = await deleteProvider(req.params.id);
    return res.json(result);
  } catch (error) {
    console.error('Error en DELETE /api/providers/:id:', error);
    if (error.message.includes('Proveedor no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudo eliminar el proveedor.' });
  }
};

export { listProviders, createProviderHandler, updateProviderHandler, deleteProviderHandler };
