import express from 'express';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/quizController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getQuizzes);
router.get('/:id', optionalProtect, getQuizById);

// Admin-only quiz management routes
router.post('/', protect, isAdmin, createQuiz);
router.put('/:id', protect, isAdmin, updateQuiz);
router.delete('/:id', protect, isAdmin, deleteQuiz);

// Admin-only question management routes
router.post('/:id/questions', protect, isAdmin, addQuestion);
router.put('/:id/questions/:questionId', protect, isAdmin, updateQuestion);
router.delete('/:id/questions/:questionId', protect, isAdmin, deleteQuestion);

export default router;
