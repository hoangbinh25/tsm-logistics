import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as revenueController from '../controllers/revenue.controller';

const router = Router();
router.get('/', verifyToken, revenueController.getStats);

export default router;