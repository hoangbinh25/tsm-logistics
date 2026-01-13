import { Router } from "express";
import { login, register, loginGoogle, forgotPassword, verifyOTP, resetPassword } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/login-google", loginGoogle);

// quên mật khẩu
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
