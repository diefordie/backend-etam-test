// src/routes/authorRoutes.js
import express from "express";
import { 
    createAuthor, 
    getAuthor, 
    editVerifiedAuthor, 
    getAuthorProfile, 
    editAuthorProfile, 
    getAuthorData, 
    getNewestTestsByAuthorController, 
    getPopularTestsByAuthorController, 
    searchTestsByTitleController, 
    fetchAuthorById,
    publishTestController, 
    deleteTestController
} from "../controllers/authorControllers.js";

import { authenticateToken } from '../middleware/authMiddleware.js'; 
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/create-author', createAuthor);
router.patch('/edit-author/:id/status', editVerifiedAuthor);
router.get('/get-author', getAuthor);
router.get('/profile', getAuthorProfile);
router.patch('/profile/edit', authenticateToken, upload.single('authorPhoto'), editAuthorProfile);
router.get('/author-data', authenticateToken, getAuthorData);
router.get('/tests-newest', authenticateToken, getNewestTestsByAuthorController);
router.get('/tests-popular', authenticateToken, getPopularTestsByAuthorController);
router.get('/tests/search', authenticateToken, searchTestsByTitleController);
router.get('/authorID', authenticateToken, fetchAuthorById);
router.patch('/tests/:id', authenticateToken, publishTestController);
router.delete('/tests/:id', authenticateToken, deleteTestController);



export default router;
