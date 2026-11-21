import express from 'express';
import { getLeaderboard, getQuizLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/:quizId', getQuizLeaderboard);

export default router;
