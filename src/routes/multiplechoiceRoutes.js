import express from 'express';
import { updateQuestionNumberDel, updateQuestionNumberPage, updateQuestionPageName, createMultipleChoice, updateMultipleChoice, getMultipleChoiceById, deleteMultipleChoice, getQuestions, updateQuestionNumber, getQuestionNumbers, getMultipleChoiceByNumberAndTestId, updateMultipleChoicePageNameController, getPagesByTestIdController } from '../controllers/multiplechoiceController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/add-questions', upload.array('questionPhoto'), (req, res) => {
    console.log('Request body:', req.body); 
    if (req.file) {
        req.body.questions.forEach(question => {
            question.questionPhoto = req.file.path; 
        });
    }
    createMultipleChoice(req, res);
});

router.put('/update-question', updateQuestionPageName); //baru
router.put('/:testId/questions/:oldNumber', updateQuestionNumberPage); //baru
// router.put('/question/update-number', updateQuestionNumberDel); // baru


router.put('/update-question/:multiplechoiceId', updateMultipleChoice);
router.put('/update-pageName', updateMultipleChoicePageNameController);
router.put('/update-questionNumber', updateQuestionNumber);

router.get('/questions/:testId', getQuestions);
// router.get('/questions/:testId', getMultipleChoice);
router.get('/question/:id', getMultipleChoiceById);
// router.get('/:testId', getQuestions);
router.get('/:testId/:number', getMultipleChoiceByNumberAndTestId);
router.get('/get-pages/:testId', getPagesByTestIdController);
router.delete('/question/:multiplechoiceId', deleteMultipleChoice);
router.get('/getQuestionNumbers', getQuestionNumbers);

export default router; 