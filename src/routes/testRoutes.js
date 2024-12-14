import express from 'express';
import { createTestController, publishTestController, getAllTests, fetchTestsByCategory, getAuthorTests, getTest, testResultController} from '../controllers/testControllers.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; 


const router = express.Router();

router.post('/tests', createTestController);
router.get('/get-test/:id', getTest);
router.get('/test-result/:resultId', testResultController);


router.put('/tests/:testId/publish', publishTestController);

router.get('/category/:category', fetchTestsByCategory);

router.get('/get-test', getAllTests);
router.get('/author-tests', authenticateToken, getAuthorTests);


export default router; 