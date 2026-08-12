import express from 'express';
import { dashboardSummary, reportSummary, sendReport, downloadReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/dashboard-summary', dashboardSummary);
router.get('/summary', reportSummary);
router.get('/download', downloadReport);
router.post('/send', sendReport);

export default router;
