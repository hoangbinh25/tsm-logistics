import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as controller from '../controllers/transport-service.controller';

const router = Router();

router.get('/', controller.getServices);
router.post('/', verifyToken, controller.createService);
router.put('/:id', verifyToken, controller.updateService);
router.delete('/:id', verifyToken, controller.deleteService);

export default router;