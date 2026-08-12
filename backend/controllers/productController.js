import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService.js';

const listProducts = async (req, res) => {
  try {
    const products = await getProducts(req.query);
    return res.json({ products });
  } catch (error) {
    console.error('Error en GET /api/products:', error);
    return res.status(500).json({ error: 'No se pudieron obtener los productos.' });
  }
};

const createProductHandler = async (req, res) => {
  try {
    const product = await createProduct(req.body);
    return res.status(201).json({ product });
  } catch (error) {
    console.error('Error en POST /api/products:', error);
    if (error.message.includes('13 dígitos')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudo crear el producto.' });
  }
};

const updateProductHandler = async (req, res) => {
  try {
    const product = await updateProduct({ id: req.params.id, ...req.body });
    return res.json({ product });
  } catch (error) {
    console.error('Error en PUT /api/products/:id:', error);
    if (error.message.includes('13 dígitos')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Producto no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudo actualizar el producto.' });
  }
};

const deleteProductHandler = async (req, res) => {
  try {
    const result = await deleteProduct(req.params.id);
    return res.json(result);
  } catch (error) {
    console.error('Error en DELETE /api/products/:id:', error);
    if (error.message.includes('Producto no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'No se pudo eliminar el producto.' });
  }
};

export { listProducts, createProductHandler, updateProductHandler, deleteProductHandler };
