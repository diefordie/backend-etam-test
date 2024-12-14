// src/routes/authorRoutes.js
import express from "express";
import { createAuthor, getAuthor, editVerifiedAuthor, getAuthorProfile, editAuthorProfile, getAuthorData } from "../controllers/authorControllers.js";
import { authenticateToken } from '../middleware/authMiddleware.js'; // Pastikan Anda memiliki middleware autentikasi
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/create-author', createAuthor);
router.patch('/edit-author/:id/status', editVerifiedAuthor);
router.get('/get-author', getAuthor);
router.get('/profile', getAuthorProfile);
router.patch('/profile/edit', authenticateToken, upload.single('authorPhoto'), editAuthorProfile);
router.get('/author-data', authenticateToken, getAuthorData);




export default router;
