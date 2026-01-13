import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { autoAssign, createOrder } from "../controllers/order.controller";

const route = Router();

// user
route.post("/", verifyToken, createOrder)

// admin
route.post('/:id/auto-assign', verifyToken, autoAssign);

export default route;