import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();
router.get('/stats', verifyToken, dashboardController.getStats);

export default router;
