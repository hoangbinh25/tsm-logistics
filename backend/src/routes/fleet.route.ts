import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as fleetController from '../controllers/fleet.controller';

const router = Router();

router.get('/', verifyToken, fleetController.getFleet);
router.post('/', verifyToken, fleetController.createFleet);
router.put('/:id', verifyToken, fleetController.updateFleet);
router.delete('/:id', verifyToken, fleetController.deleteFleet);

export default router;