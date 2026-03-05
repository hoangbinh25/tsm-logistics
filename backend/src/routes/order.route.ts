import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { assignOrder, autoAssign, createOrder, getMyTasks, getOrderByCode, getOrderById, getOrders, updateOrderStatus, cancelOrder } from "../controllers/order.controller";
import { getPaymentLink, getPaymentStatus, vnpayIpn } from "../controllers/payment.controller";

const route = Router();

route.get('/vnpay-ipn', vnpayIpn);

// user
route.post("/", verifyToken, createOrder)
route.get('/', verifyToken, getOrders);

route.post("/:id/cancel", verifyToken, cancelOrder);
route.get("/:id/payment-link", verifyToken, getPaymentLink);
route.get("/:id/payment-status", verifyToken, getPaymentStatus);

route.get("/tracking/:code", getOrderByCode)
// driver
route.get('/my-tasks', verifyToken, getMyTasks);
route.patch('/:id/status', verifyToken, updateOrderStatus);
route.get('/:id', verifyToken, getOrderById);
// admin
route.post('/:id/auto-assign', verifyToken, autoAssign);
route.post('/:id/assign', verifyToken, assignOrder);
export default route;