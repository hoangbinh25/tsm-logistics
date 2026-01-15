import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendOrderConfirmationEmail } from '../utils/mailer';

export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

        // Lấy role từ token
        const roles = req.user?.role || [];
        
        // Kiểm tra quyền Admin
        const isAdmin = roles === 'QUAN_LY';

        // GỌI SERVICE DUY NHẤT
        // Truyền cờ isAdmin để Service tự biết đường lọc
        const orders = await orderService.getOrdersService({ 
            userId, 
            isAdmin 
        });

        res.status(200).json({ 
            message: "Lấy danh sách thành công", 
            data: orders 
        });

    } catch (error: any) {
        console.error("Get Orders Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
    }
};
export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;
        console.log("userID: ", userId)
        const userEmail = req.user?.email; 

        if (!userId) return res.status(401).json({ message: "Chưa xác thực token thành công" });

        const { senderInfo, receiverInfo, warehouseId, serviceId, paymentMethod, note, items } = req.body;

        // Validate cơ bản
        if (!receiverInfo?.phone || !warehouseId || !items?.length || !serviceId) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc (Người nhận, Kho, Dịch vụ, Hàng hóa)" });
        }

        // Tạo đơn hàng (Logic cũ)
        const newOrder = await orderService.createOrderService({
            userId,
            senderAddress: senderInfo?.address || "",
            receiverInfo,
            warehouseId,
            serviceId,
            paymentMethod,
            note,
            items
        });

        if (userEmail) {
            // Không dùng 'await' ở đây để Client không phải chờ gửi mail xong mới thấy thông báo
            sendOrderConfirmationEmail(userEmail, {
                ma_don_hang: newOrder.ma_don_hang,
                receiverName: receiverInfo.name,
                receiverPhone: receiverInfo.phone,
                tong_thanh_toan: newOrder.tong_thanh_toan,
                hinh_thuc_thanh_toan: newOrder.hinh_thuc_thanh_toan
            }).catch(err => console.error("Lỗi gửi mail background:", err));
        }

        res.status(201).json({
            message: "Tạo đơn hàng thành công",
            data: newOrder
        });

    } catch (error: any) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: error.message || "Lỗi máy chủ nội bộ" });
    }
};

export const autoAssign = async (req: Request, res: Response) => {
    try {
        const result = await orderService.autoAssignDriverService(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy danh sách task của tài xế
export const getMyTasks = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub; 

        if (!userId) {
            return res.status(401).json({ message: "Không xác định được danh tính" });
        }

        const tasks = await orderService.getDriverTasksService(userId);

        res.status(200).json({ 
            message: "Lấy danh sách công việc thành công",
            data: tasks 
        });

    } catch (error: any) {
        console.error("GetMyTasks Error:", error);
        if (error.message === "NOT_DRIVER") {
            return res.status(403).json({ message: "Tài khoản này chưa đăng ký làm tài xế" });
        }
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// API Public: Tra cứu đơn hàng theo Mã vận đơn
export const getOrderByCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.params; // Lấy mã từ URL

        // Gọi Service
        const order = await orderService.getOrderByCodeService(code);

        // Xử lý kết quả trả về
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng hoặc mã vận đơn không đúng." });
        }

        res.status(200).json({ 
            message: "Tra cứu thành công",
            data: order 
        });

    } catch (error) {
        console.error("Tracking Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tra cứu đơn hàng" });
    }
};