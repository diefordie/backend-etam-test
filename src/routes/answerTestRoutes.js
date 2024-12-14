import express from 'express';
import { saveDraft, submitFinal, updateDraft, getAnswersByResultIdController, getResultStatus} from '../controllers/answerTestController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route untuk mengambil detail tes berdasarkan ID
// GET /api/tests/:testId
// Route untuk submit jawaban tes

// POST /api/tests/:testId/submit
// router.get('/tests/get-test/:testId', getTestQuestions);
// router.post('/tests/:testId/createResultId', authenticateToken, createResultId);
router.post('/tests/:testId/temp', saveDraft);
router.patch('/tests/:testId/update', updateDraft);
router.get('/tests/:resultId/', getAnswersByResultIdController);
router.patch('/tests/submit', submitFinal);
router.get('/tests/:resultId/status', getResultStatus);

export default router;