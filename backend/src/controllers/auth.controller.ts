import { Request, Response } from "express";
import { loginService, registerService, loginGoogleService } from "../services/auth.service";

export async function login(req: Request, res: Response) {
    const result = await loginService(req.body);
    res.json(result)
}

export async function register(req: Request, res: Response) {
    const result = await registerService(req.body);
    res.json(result)
}

export async function loginGoogle(req: Request, res: Response) {
    try {
        const { token } = req.body;
        if(!token) {
            return res.status(400).json({ message: "Token is required"})
        }
        const result = await loginGoogleService(token);
        res.json(result);
    } catch (error: any) {
        console.error("Login Google error: ", error)
        res.status(400).json({
            message: error.message || "Đăng nhập Google thất bại"
        })
    }
}