import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { autoAssign, createOrder, getMyTasks, getOrderByCode, getOrders } from "../controllers/order.controller";

const route = Router();

// user
route.post("/", verifyToken, createOrder)
route.get('/', verifyToken, getOrders);
route.get("/tracking/:code", getOrderByCode)
// driver
route.get('/my-tasks', verifyToken, getMyTasks);

// admin
route.post('/:id/auto-assign', verifyToken, autoAssign);

export default route;