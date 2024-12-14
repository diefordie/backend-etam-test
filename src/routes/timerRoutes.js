import express from 'express';
import { getWorktime } from '../controllers/timerController.js';

const router = express.Router();

// Route untuk mendapatkan waktu kerja (timer) berdasarkan testId
router.get('/:testId/worktime', getWorktime);

export default router;
