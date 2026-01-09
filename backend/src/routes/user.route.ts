import { Router } from "express";
import {upload} from "../middlewares/upload.middleware"
import { verifyToken } from "../middlewares/auth.middleware";
import { updateProfile } from "../controllers/user.controller";

const router = Router();

router.put("/profile", verifyToken, upload.single('avatar'), updateProfile)

export default router;