import express from 'express';
import { listProducts, createProductHandler, updateProductHandler, deleteProductHandler } from '../controllers/productController.js';

const router = express.Router();

router.get('/', listProducts);
router.post('/', createProductHandler);
router.put('/:id', updateProductHandler);
router.delete('/:id', deleteProductHandler);

export default router;
