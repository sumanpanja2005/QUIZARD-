import express from 'express';
import { getProfile, updateProfile, getDashboard } from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isStudent } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(isStudent);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);

export default router;
