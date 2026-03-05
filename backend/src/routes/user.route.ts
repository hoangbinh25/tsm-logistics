import { Router } from "express";
import { upload } from "../middlewares/upload.middleware"
import { verifyToken } from "../middlewares/auth.middleware";
import { getUsers, updateProfile, getCustomerDetail } from "../controllers/user.controller";

const router = Router();

// admin
router.get("/", verifyToken, getUsers)
router.get("/customers/:id", verifyToken, getCustomerDetail)

// user
router.put("/profile", verifyToken, upload.single('avatar'), updateProfile)

export default router;