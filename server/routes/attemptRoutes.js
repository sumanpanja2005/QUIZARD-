import express from 'express';
import {
  startAttempt,
  submitAttempt,
  getMyAttempts,
  getAttemptResult,
} from '../controllers/attemptController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isStudent } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/start', isStudent, startAttempt);
router.post('/submit', isStudent, submitAttempt);
router.get('/my-attempts', isStudent, getMyAttempts);
router.get('/:id/result', getAttemptResult);

export default router;
