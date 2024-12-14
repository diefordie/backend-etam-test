import express from 'express';
import TestController from '../controllers/detailsoalController.js';

const router = express.Router();

// Define the endpoint to get test details by testId
router.get('/:testId/detail', TestController.getTestDetails);

export default router;
