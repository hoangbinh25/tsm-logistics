import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as warehouseController from '../controllers/warehouse.controller';

const router = Router();

router.get('/', verifyToken, warehouseController.getWarehouses);
router.post('/', verifyToken, warehouseController.createWarehouse);
router.put('/:id', verifyToken, warehouseController.updateWarehouse);
router.delete('/:id', verifyToken, warehouseController.deleteWarehouse);

export default router;