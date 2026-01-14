import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { autoAssign, createOrder, getMyOrders } from "../controllers/order.controller";

const route = Router();

// user
route.post("/", verifyToken, createOrder)
route.get('/', verifyToken, getMyOrders);

// admin
route.post('/:id/auto-assign', verifyToken, autoAssign);

export default route;