// routes/withdrawalRoutes.js
import express from 'express';
import createPayout from '../controllers/payoutControllers.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/payout', authenticateToken, createPayout);

export default router;