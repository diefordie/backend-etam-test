import express from 'express';
import { registrasi, login, logout, forgotPassword, resetPasswordController } from '../controllers/authController.js';

const router = express.Router();

// Route untuk registrasi
router.post('/registrasi', registrasi);

// Route untuk login
router.post('/login', login);

// Route untuk logout
router.post('/logout', logout);


router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordController);


export default router;
