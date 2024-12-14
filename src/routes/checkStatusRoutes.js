import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js'; // Import middleware otentikasi
import { checkTransactionStatus } from '../controllers/checkStatusController.js'; // Import controller yang diperbarui

const router = express.Router();

// Ubah ke permintaan GET
router.get('/transaction/check-status', authenticateToken, checkTransactionStatus);

export default router;
