import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { calculateFee, getOrderStatus, handleWebhook } from "../controllers/ghtk.controller";

const route = Router();

route.get("/fee", verifyToken, calculateFee);
route.get("/status/:label", verifyToken, getOrderStatus);
route.post("/webhook", handleWebhook);

export default route;
