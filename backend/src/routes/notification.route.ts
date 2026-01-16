import { Router } from "express";
import { getMyNotifications } from "../controllers/notification.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get('/', verifyToken, getMyNotifications);

export default router;