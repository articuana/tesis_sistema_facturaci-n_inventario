import express from 'express';
import { lookupCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.get('/lookup', lookupCustomer);

export default router;
