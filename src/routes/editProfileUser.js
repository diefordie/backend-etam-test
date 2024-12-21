import express from 'express';
import { 
  getUserProfile,
  updateName,
  updateEmail,
  changePassword,
  uploadPhoto,
  deletePhoto 
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

const upload = multer({ storage: multer.memoryStorage() });

router.get('/profile', authenticateToken, getUserProfile);

router.patch(
  '/profile/name', 
  authenticateToken, 
  validateUserName,
  checkValidationResult, 
  updateName
);

router.patch(
  '/profile/email', 
  authenticateToken, 
  validateUserEmail,
  checkValidationResult, 
  updateEmail
);

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
  uploadPhoto
);

router.patch(
  '/profile/photo', 
  authenticateToken,
  validateUserPhoto,
  upload.single('profileImage'),
  uploadPhoto
);

router.delete(
  '/profile/photo', 
  authenticateToken, 
  deletePhoto);

export default router;