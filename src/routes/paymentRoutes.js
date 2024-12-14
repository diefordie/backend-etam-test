import express from 'express';
import PaymentController from '../controllers/paymentControllers.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // Import middleware autentikasi

const router = express.Router();

router.post("/payment-process", authenticateToken, PaymentController.processPayment);

router.post('/webhook', PaymentController.handleWebhook);

export default router;