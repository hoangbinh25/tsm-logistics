import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { autoAssign } from "../controllers/order.controller";

const route = Router();

route.post('/:id/auto-assign', verifyToken, autoAssign);

export default route;