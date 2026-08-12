import express from 'express';
import { listInvoices, getInvoice, downloadInvoice, deleteInvoice, createInvoiceHandler } from '../controllers/invoiceController.js';

const router = express.Router();

router.get('/', listInvoices);
router.get('/:id/pdf', downloadInvoice);
router.get('/:id', getInvoice);
router.delete('/:id', deleteInvoice);
router.post('/', createInvoiceHandler);

export default router;
