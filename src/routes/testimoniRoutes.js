import { Router } from 'express';
import { getTestimonis, createTestimoniController } from '../controllers/testimoniController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Get all testimonies
router.get('/testimonies', getTestimonis);

// Post new testimony (Hanya bisa diakses oleh user yang sudah login)
router.post('/testimonies', authenticateToken, createTestimoniController);

export default router;