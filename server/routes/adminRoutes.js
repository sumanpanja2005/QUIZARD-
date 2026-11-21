import express from 'express';
import {
  getAdminDashboard,
  getAdminStudents,
  toggleStudentStatus,
  getAdminSubmissions,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/students', getAdminStudents);
router.put('/students/:id/status', toggleStudentStatus);
router.get('/submissions', getAdminSubmissions);

export default router;
