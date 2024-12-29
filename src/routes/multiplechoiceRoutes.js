import express from 'express';
import {  getPreviousQuestion, updateQuestionNumberDel, updateQuestionNumberPage, updateQuestionPageName, createMultipleChoice, updateMultipleChoice, getMultipleChoiceById, deleteMultiplechoice,  updateQuestionNumber, getQuestionNumbers, getMultipleChoiceByNumberAndTestId, updateMultipleChoicePageNameController, getPagesByTestIdController, deletePageController, updateNumberController } from '../controllers/multiplechoiceController.js';
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

router.put('/update-question/:multiplechoiceId', updateMultipleChoice); //perlu
router.put('/update-question', updateQuestionPageName);
router.put('/update-pageName', updateMultipleChoicePageNameController); //perlu
router.put('/:testId/questions/:oldNumber', updateQuestionNumberPage);
router.put('/question/update-number', updateQuestionNumberDel);
router.get('/question/:id', getMultipleChoiceById); //perlu
router.delete('/question/:multiplechoiceId', deleteMultiplechoice); //perlu
router.get('/:testId/:number', getMultipleChoiceByNumberAndTestId); //perlu
router.get('/get-pages/:testId', getPagesByTestIdController); //perlu
router.get('/getQuestionNumbers', getQuestionNumbers); //perlu
router.put('/update-questionNumber', updateQuestionNumber); //perlu
router.delete('/delete-page', deletePageController);
router.put('/update-number', updateNumberController);
router.get('/previous-question/:testId/:number', getPreviousQuestion);

export default router; 