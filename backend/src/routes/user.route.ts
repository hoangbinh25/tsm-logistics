import { Router } from "express";
import {upload} from "../middlewares/upload.middleware"
import { verifyToken } from "../middlewares/auth.middleware";
import { getUsers, updateProfile } from "../controllers/user.controller";

const router = Router();

// admin
router.get("/", verifyToken, getUsers)

// user
router.put("/profile", verifyToken, upload.single('avatar'), updateProfile)

export default router;