import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as notificationService from '../services/notification.service';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub; 
        
        if (!userId) {
            return res.status(401).json({ message: "Không tìm thấy thông tin người dùng" });
        }

        // Gọi Service
        const notis = await notificationService.getUserNotificationsService(userId);

        res.status(200).json({ 
            message: "Lấy thông báo thành công",
            data: notis 
        });

    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ message: "Lỗi tải danh sách thông báo" });
    }
};