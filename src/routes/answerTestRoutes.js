import express from 'express';
import { saveDraft, submitFinal, updateDraft, getAnswersByResultIdController} from '../controllers/answerTestController.js';

const router = express.Router();

// Route untuk mengambil detail tes berdasarkan ID
// GET /api/tests/:testId
// Route untuk submit jawaban tes

// POST /api/tests/:testId/submit
router.post('/tests/:testId/temp', saveDraft);
router.patch('/tests/:testId/update', updateDraft);
router.get('/tests/:resultId/', getAnswersByResultIdController);
router.patch('/tests/:resultId/submit', submitFinal);

export default router;