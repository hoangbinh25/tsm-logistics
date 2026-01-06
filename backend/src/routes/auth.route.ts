import { Router } from "express";
import { login, register, loginGoogle } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/login-google", loginGoogle);


export default router;
