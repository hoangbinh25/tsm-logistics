import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { assignOrder, autoAssign, createOrder, getMyTasks, getOrderByCode, getOrderById, getOrders, updateOrderStatus } from "../controllers/order.controller";

const route = Router();

// user
route.post("/", verifyToken, createOrder)
route.get('/', verifyToken, getOrders);
route.get("/tracking/:code", verifyToken, getOrderByCode)
// driver
route.get('/my-tasks', verifyToken, getMyTasks);
route.patch('/:id/status', verifyToken, updateOrderStatus);
route.get('/:id', verifyToken, getOrderById);
// admin
route.post('/:id/auto-assign', verifyToken, autoAssign);
route.post('/:id/assign', verifyToken, assignOrder);
export default route;