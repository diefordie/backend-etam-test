import express from 'express';
import { loginAdmin } from '../controllers/adminControllers.js'; // Pastikan jalur benar

const router = express.Router();

// Endpoint untuk login admin
router.post('/login', loginAdmin);

export default router;
