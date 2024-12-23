// routes/withdrawalRoutes.js
import express from 'express';
import {createPayout, getTransactionHistory} from '../controllers/payoutControllers.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history', authenticateToken, getTransactionHistory);
router.post('/payout', authenticateToken, createPayout);

export default router;