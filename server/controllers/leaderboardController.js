import { getGlobalLeaderboard, getCompetitionLeaderboard } from '../services/rankingService.js';
import Quiz from '../models/Quiz.js';

// @desc    Get global student leaderboard
// @route   GET /api/leaderboard
// @access  Public
export const getLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const leaderboardData = await getGlobalLeaderboard({ page, limit });

    res.status(200).json({
      success: true,
      data: leaderboardData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get competition-specific leaderboard
// @route   GET /api/leaderboard/:quizId
// @access  Public / Protected
export const getQuizLeaderboard = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const quiz = await Quiz.findById(quizId).select('title subject totalMarks duration status');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Competition not found.' });
    }

    const leaderboardData = await getCompetitionLeaderboard(quizId, { page, limit });

    res.status(200).json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        totalMarks: quiz.totalMarks,
        duration: quiz.duration,
      },
      data: leaderboardData,
    });
  } catch (error) {
    next(error);
  }
};
