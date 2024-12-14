// backend/routes/riwayattransaksiRoutes.js
import express from 'express';
import { getUserTransactionHistory } from '../controllers/riwayattransaksiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route to get transaction history by user ID, userId is obtained from JWT token
router.get('/riwayat-transaksi', authenticateToken, getUserTransactionHistory);

// Protected route to get transaction details by transaction ID, requires JWT authentication
// router.get('/riwayat-transaksi/detail/:transactionId', authenticateToken, getTransactionDetails);

export default router;