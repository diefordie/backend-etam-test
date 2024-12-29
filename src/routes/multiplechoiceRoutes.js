import express from 'express';
import {
    updateQuestionNumberDel,
    updateQuestionNumberPage,
    updateQuestionPageName,
    createMultipleChoice,
    updateMultipleChoice,
    getMultipleChoiceById,
    deleteMultiplechoice,
    updateQuestionNumber,
    getQuestionNumbers,
    getMultipleChoiceByNumberAndTestId,
    updateMultipleChoicePageNameController,
    getPagesByTestIdController,
    deletePageController,
    updateNumberController
} from '../controllers/multiplechoiceController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Specific routes first
router.get('/getQuestionNumbers', getQuestionNumbers);
router.get('/get-pages/:testId', getPagesByTestIdController);
router.get('/question/:id', getMultipleChoiceById);

// POST routes
router.post('/add-questions', upload.array('questionPhoto'), (req, res) => {
    console.log('Request body:', req.body);
    if (req.file) {
        req.body.questions.forEach(question => {
            question.questionPhoto = req.file.path;
        });
    }
    createMultipleChoice(req, res);
});

// PUT routes
router.put('/update-question/:multiplechoiceId', updateMultipleChoice);
router.put('/update-question', updateQuestionPageName);
router.put('/update-pageName', updateMultipleChoicePageNameController);
router.put('/question/update-number', updateQuestionNumberDel);
router.put('/update-questionNumber', updateQuestionNumber);
router.put('/update-number', updateNumberController);
router.put('/:testId/questions/:oldNumber', updateQuestionNumberPage);

// DELETE routes
router.delete('/question/:multiplechoiceId', deleteMultiplechoice);
router.delete('/delete-page', deletePageController);

// More general routes last
router.get('/:testId/:number', getMultipleChoiceByNumberAndTestId);

export default router;