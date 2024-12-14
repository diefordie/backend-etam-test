import express from 'express';
import { getPopularTests, getFreeTests, searchTestsByTitle, searchTestsByTitleAndCategory, getTestsByCategory, getPopularTestsByCategory, getFreeTestsByCategory } from '../controllers/dashboardController.js';
const router = express.Router();

// Routes for dashboard services
router.get('/popular-tests', getPopularTests);
router.get('/free-tests', getFreeTests);
router.get('/search-tests', searchTestsByTitle);
router.get('/search-tests-by-category', searchTestsByTitleAndCategory);
router.get('/tests-by-category', getTestsByCategory);
router.get('/popular-tests-by-category', getPopularTestsByCategory);
router.get('/free-tests-by-category', getFreeTestsByCategory);

export default router;