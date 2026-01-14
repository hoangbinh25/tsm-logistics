import { Request, Response } from "express";
import { getUsersService, updateProfileService } from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Lấy tham số từ Query String (VD: /users?role=TAI_XE)
        const { role } = req.query;
        
        // 2. Gọi Service để lấy dữ liệu
        // Ép kiểu (role as string) để khớp với tham số bên Service
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

export const updateProfile = async(req: AuthRequest, res: Response) => {
    try {
        if(!req.user) {
            return res.status(401).json({ message: "Không tìm thấy thông tin người dùng" });
        }
        const userId = req.user?.sub;
        const file = req.file;
        const data = req.body;

        const updatedUser = await updateProfileService(userId, data, file)

        res.status(200).json({
            message: "Cập nhật hồ sơ thành công",
            user: updatedUser
        })
    } catch (error: any) {
        console.error("Update profile error: ", error)
        res.status(500).json({
            message: "Lỗi server", 
            error: error.message
        })
    }
}