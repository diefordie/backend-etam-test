import express from 'express';
import { 
  getUserProfile,
  updateName,
  updateEmail,
  changePassword,
  uploadPhoto 
} from '../controllers/editProfileUser.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { 
  validateUserName, 
  validateUserEmail, 
  validatePasswordChange, 
  validateUserPhoto,
  checkValidationResult 
} from '../validator/userProfileUser.js';
import multer from 'multer';

const router = express.Router();

// Konfigurasi `multer` untuk menyimpan file di memori
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint untuk mendapatkan data profil pengguna
router.get('/profile', authenticateToken, getUserProfile);

// Endpoint untuk memperbarui nama pengguna
router.patch(
  '/profile/name', 
  authenticateToken, 
  validateUserName,
  checkValidationResult, 
  updateName
);

// Endpoint untuk memperbarui email pengguna
router.patch(
  '/profile/email', 
  authenticateToken, 
  validateUserEmail,
  checkValidationResult, 
  updateEmail
);

// Endpoint untuk mengubah kata sandi pengguna
router.patch(
  '/profile/password', 
  authenticateToken, 
  validatePasswordChange, 
  checkValidationResult, 
  changePassword
);

router.post(
  '/profile/photo', 
  authenticateToken,
  validateUserPhoto,
  upload.single('profileImage'),
  uploadPhoto // Controller yang sama dapat menangani unggahan pertama kali
);

// Endpoint untuk memperbarui foto profil pengguna
router.patch(
  '/profile/photo', 
  authenticateToken,
  validateUserPhoto,
  upload.single('profileImage'),
  uploadPhoto // Controller yang sama dapat menangani pembaruan foto
);

export default router;