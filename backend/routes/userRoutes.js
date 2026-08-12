import express from 'express';
import { ensureAdmin } from '../middleware/auth.js';
import { listUsers, createUserHandler, updateUserHandler, deleteUserHandler } from '../controllers/userController.js';

const router = express.Router();

router.get('/', ensureAdmin, listUsers);
router.post('/', ensureAdmin, createUserHandler);
router.put('/:id', ensureAdmin, updateUserHandler);
router.delete('/:id', ensureAdmin, deleteUserHandler);

export default router;
