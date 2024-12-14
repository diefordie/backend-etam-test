// routes/topScoreRoutes.js
import express from 'express';
import { getTopScores } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/leaderboard/:testId', getTopScores);

export default router;