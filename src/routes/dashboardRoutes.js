import express from 'express';
import { 
    getPopularTests, 
    getFreeTests, 
    searchTestsByTitle, 
    searchTestsByTitleAndCategory, 
    getTestsByCategory, 
    getPopularTestsByCategory, 
    getFreeTestsByCategory,
    getLockedTests,
    getLockedTestsByCategory
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/popular-tests', getPopularTests);
router.get('/free-tests', getFreeTests);
router.get('/search-tests', searchTestsByTitle);
router.get('/search-tests-by-category', searchTestsByTitleAndCategory);
router.get('/tests-by-category', getTestsByCategory);
router.get('/popular-tests-by-category', getPopularTestsByCategory);
router.get('/free-tests-by-category', getFreeTestsByCategory);
router.get('/locked-tests', getLockedTests);
router.get('/locked-tests-by-category', getLockedTestsByCategory);

export default router;
