import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as fleetController from '../controllers/fleet.controller';

const router = Router();

router.get('/check-maintenance', fleetController.checkMaintenance);
router.post('/:id/maintain', verifyToken, fleetController.maintainFleet);
router.get('/', fleetController.getFleet);
router.post('/', verifyToken, fleetController.createFleet);
router.put('/:id', verifyToken, fleetController.updateFleet);
router.put('/:id/location', verifyToken, fleetController.updateLocation);
router.delete('/:id', verifyToken, fleetController.deleteFleet);

export default router;