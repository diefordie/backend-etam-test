import express from 'express';
import { loginAdmin, getDashboardStatsController } from '../controllers/adminControllers.js'; // Pastikan jalur benar

const router = express.Router();

// Endpoint untuk login admin
router.post('/login', loginAdmin);
router.get('/dashboard-stats', getDashboardStatsController);

export default router;
