import { Request, Response } from "express";
import { getUsersService, updateProfileService } from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Lấy tham số từ Query String (VD: /users?role=TAI_XE)
        const { role } = req.query;
        
        // 2. Gọi Service để lấy dữ liệu
        const users = await getUsersService(role as string);

        // 3. Trả về kết quả
        res.status(200).json({ 
            message: "Lấy danh sách thành công", 
            data: users 
        });

    } catch (error: any) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;

        if (!userId) {
             return res.status(401).json({ message: "Không xác định được danh tính người dùng" });
        }

        // 2. Lấy link ảnh (nếu có)
        const avatarUrl = req.file ? req.file.path : undefined;

        // 3. Gọi Service (Lúc này TypeScript đã hiểu userId chắc chắn là string)
        const updatedUser = await updateProfileService(userId, req.body, avatarUrl);

        res.status(200).json({
            message: "Cập nhật hồ sơ thành công",
            user: updatedUser
        });
    } catch (error: any) {
        console.error("Update profile error: ", error);

        if (error.code === 'P2002') {
            const target = error.meta?.target;
            
            if (Array.isArray(target) && target.includes('so_dien_thoai')) {
                return res.status(409).json({ 
                    message: "Số điện thoại này đã được đăng ký bởi tài khoản khác. Vui lòng dùng số khác." 
                });
            }
        }

        res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
};