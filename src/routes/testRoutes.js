import express from 'express';
import { getTest, testResultController, createTestController, publishTestController, getAllTests, fetchTestsByCategory, getAuthorTests, getTestDetail  } from '../controllers/testControllers.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; 


const router = express.Router();

router.get('/get-test/:id', getTest);
router.get('/test-result/:resultId', testResultController);
router.get('/get-test', getAllTests);
router.get('/category/:category', fetchTestsByCategory);
router.get('/author-tests', authenticateToken, getAuthorTests);
router.get('/test-detail/:testId', getTestDetail);

router.post('/tests', createTestController);

router.put('/tests/:testId/publish', publishTestController);




export default router; // Menggunakan default export
