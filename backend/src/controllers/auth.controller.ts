import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";

export async function login(req: Request, res: Response) {
    const result = await AuthService.loginService(req.body);
    res.json(result)
}

export async function register(req: Request, res: Response) {
    const result = await AuthService.registerService(req.body);
    res.json(result)
}

export async function loginGoogle(req: Request, res: Response) {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token is required" })
        }
        const result = await AuthService.loginGoogleService(token);
        res.json(result);
    } catch (error: any) {
        console.error("Login Google error: ", error)
        res.status(400).json({
            message: error.message || "Đăng nhập Google thất bại"
        })
    }
}

// 1. Controller gửi yêu cầu quên mật khẩu
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const result = await AuthService.requestPasswordReset(email);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// 2. Controller xác thực OTP 
export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        // Gọi service tại đây
        const result = await AuthService.verifyOTP(email, otp);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// 3. Controller đặt lại mật khẩu 
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, otp, newPassword } = req.body;
        // Gọi service tại đây
        const result = await AuthService.resetPassword(email, otp, newPassword);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export async function refreshToken(req: Request, res: Response) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }
        const result = await AuthService.refreshTokenService(refreshToken);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
}
