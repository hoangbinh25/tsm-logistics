import { Request, Response } from "express";
import { updateProfileService } from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middleware";

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