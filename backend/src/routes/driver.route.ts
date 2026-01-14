import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware'; 
import * as controller from '../controllers/driver.controller';

const router = Router();

// POST: /drivers/register
router.post('/register', verifyToken, upload.array('licenseImages', 2), controller.registerDriver);

// Admin
router.get('/list', verifyToken, controller.getAllDrivers);
router.put('/verify/:driverId', verifyToken, controller.verifyDriver);
export default router;