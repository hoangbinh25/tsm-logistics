import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as scheduleController from '../controllers/schedule.controller';

const router = Router();

// Tài xế tự đăng ký và xem lịch
router.post('/register', verifyToken, scheduleController.registerSchedule);
router.get('/my-schedules', verifyToken, scheduleController.getMySchedules);

// Admin quản lý toàn bộ
router.get('/all', verifyToken, scheduleController.getAllSchedules);
router.patch('/:id/status', verifyToken, scheduleController.updateStatus);

export default router;
