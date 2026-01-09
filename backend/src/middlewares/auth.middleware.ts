import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Định nghĩa Interface mở rộng để TypeScript hiểu req.user là gì
export interface AuthRequest extends Request {
    user?: {
        sub: string;  // User ID
        role: string; // Vai trò (KHACH_HANG, TAI_XE,...)
    };
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Lấy token từ header "Authorization"
        // Định dạng chuẩn: "Bearer <token_string>"
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập (Thiếu Token)" });
        }

        // 2. Tách lấy phần token phía sau chữ "Bearer "
        const token = authHeader.split(" ")[1];

        // 3. Verify token bằng Secret Key
        const secret = process.env.JWT_ACCESS_SECRET;
        
        if (!secret) {
            console.error("Chưa cấu hình JWT_ACCESS_SECRET trong file .env");
            return res.status(500).json({ message: "Lỗi cấu hình server" });
        }

        const decoded = jwt.verify(token, secret);

        // 4. Gắn thông tin user đã giải mã vào req để các bước sau dùng
        (req as AuthRequest).user = decoded as any;

        // 5. Cho phép đi tiếp sang Controller
        next();

    } catch (error: any) {
        console.error("JWT Verification Error:", error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" });
        }
        
        return res.status(403).json({ message: "Token không hợp lệ" });
    }
};