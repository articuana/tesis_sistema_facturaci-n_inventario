import express from 'express';
import { ensureAdmin } from '../middleware/auth.js';
import { listProviders, createProviderHandler, updateProviderHandler, deleteProviderHandler } from '../controllers/providerController.js';

const router = express.Router();

router.get('/', listProviders);
router.post('/', ensureAdmin, createProviderHandler);
router.put('/:id', ensureAdmin, updateProviderHandler);
router.delete('/:id', ensureAdmin, deleteProviderHandler);

export default router;
