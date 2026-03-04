import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendOrderConfirmationEmail } from '../utils/mailer';

export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

        const role = req.user?.role || 'USER';

        // Lấy tham số ?type=history từ URL
        const { type } = req.query;

        const orders = await orderService.getOrdersService({
            userId,
            role: role as string,
            type: type as 'active' | 'history' | undefined
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

export const getOrderByID = async (req: AuthRequest, res: Response) => {
    try {
        const { code } = req.params;

        // Lấy thông tin người đang xem từ Token
        const userId = req.user?.sub;
        const role = req.user?.role || 'USER';

        if (!userId) {
            return res.status(401).json({ message: "Vui lòng đăng nhập để tra cứu." });
        }

        // Gọi Service (Service sẽ tự lo việc check quyền)
        const order = await orderService.getTrackingOrderService(code, userId, role as string);

        res.status(200).json({
            message: "Tra cứu thành công",
            data: order
        });

    } catch (error: any) {
        console.error("Tracking Error:", error);

        // Xử lý các lỗi Service ném ra
        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Không tìm thấy mã vận đơn này." });
        }

        if (error.message === "FORBIDDEN") {
            return res.status(403).json({
                message: "Bạn không có quyền xem đơn hàng này (Không phải đơn của bạn)."
            });
        }

        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Lấy dữ liệu đầu vào
        const userId = req.user?.sub;
        const userEmail = req.user?.email;
        const body = req.body;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        if (!body.receiverInfo?.phone || !body.warehouseId || !body.serviceId) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }
        const result = await orderService.createOrderService({
            userId,
            userEmail,
            senderAddress: body.senderInfo?.address || "",
            ...body
        });

        // 3. Trả về kết quả
        res.status(201).json({
            message: "Tạo đơn hàng thành công",
            data: result.order        // Đơn hàng đã tạo
        });

    } catch (error: any) {
        console.error("Create Order Controller Error:", error);
        res.status(500).json({ message: error.message || "Lỗi server" });
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

export const assignOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { tai_xe_id, phuong_tien_id } = req.body;

        if (!tai_xe_id || !phuong_tien_id) {
            return res.status(400).json({ message: "Thiếu thông tin tài xế hoặc xe" });
        }

        const updatedOrder = await orderService.assignOrderService(id, tai_xe_id, phuong_tien_id);

        res.status(200).json({
            message: "Phân công thành công",
            data: updatedOrder
        });
    } catch (error: any) {
        console.error("Assign Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
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

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;

        // Gọi Service xử lý logic
        await orderService.updateOrderStatusService(id, trang_thai);

        res.status(200).json({ message: "Cập nhật trạng thái thành công" });

    } catch (error: any) {
        console.error("Update Status Error:", error);

        // Xử lý các lỗi cụ thể từ Service ném ra
        if (error.message === "INVALID_STATUS") {
            return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }
        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const order = await orderService.getOrderByIdService(id);

        if (!order) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        }

        res.status(200).json({ data: order });

    } catch (error) {
        console.error("Get Order Detail Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};