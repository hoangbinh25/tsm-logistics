import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getAllDriversService, registerDriverService, verifyDriverService, getDriverPerformanceService } from '../services/driver.service';

export const registerDriver = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        // 1. Lấy dữ liệu từ Request
        const { so_gplx, hang_bang, kinh_nghiem, ngay_het_han } = req.body;
        const files = req.files as Express.Multer.File[];

        // 2. Validate Input (Việc của Controller)
        if (!files || files.length < 2) {
            return res.status(400).json({ message: "Vui lòng upload đủ 2 mặt ảnh bằng lái xe" });
        }

        // 3. Gọi Service để xử lý
        await registerDriverService({
            userId,
            so_gplx,
            hang_bang,
            kinh_nghiem: Number(kinh_nghiem),
            ngay_het_han: new Date(ngay_het_han),
            frontLicenseUrl: files[0].path, // Cloudinary URL file 1
            backLicenseUrl: files[1].path   // Cloudinary URL file 2
        });

        // 4. Trả về thành công
        res.status(201).json({ message: "Gửi hồ sơ thành công! Đang chờ duyệt." });

    } catch (error: any) {
        console.error("Register Driver Error:", error);

        // Xử lý các lỗi cụ thể từ Service ném ra
        if (error.message === "PROFILE_EXISTS") {
            return res.status(400).json({ message: "Hồ sơ tài xế đã tồn tại hoặc đang chờ duyệt." });
        }

        // Lỗi từ Prisma (Unique constraint - trùng số GPLX)
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Số Giấy phép lái xe này đã được đăng ký." });
        }

        res.status(500).json({ message: "Lỗi hệ thống nội bộ" });
    }
};

export const getAllDrivers = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query; // Lấy filter từ query param ?status=PENDING

        const drivers = await getAllDriversService(status as string);

        res.status(200).json({
            message: "Lấy danh sách thành công",
            data: drivers
        });
    } catch (error: any) {
        console.error("Get All Drivers Error:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

// 2. API Duyệt hồ sơ (Admin)
export const verifyDriver = async (req: AuthRequest, res: Response) => {
    try {
        const { driverId } = req.params;
        const { status, reason } = req.body;

        // Validate cơ bản
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: "Trạng thái chỉ được là APPROVED hoặc REJECTED" });
        }
        if (status === 'REJECTED' && !reason) {
            return res.status(400).json({ message: "Vui lòng nhập lý do từ chối" });
        }

        // Gọi Service
        await verifyDriverService(driverId, status, reason);

        res.status(200).json({
            message: `Hồ sơ đã được cập nhật sang trạng thái: ${status}`
        });

    } catch (error: any) {
        console.error("Verify Driver Error:", error);
        // Có thể bắt lỗi P2025 nếu không tìm thấy ID
        res.status(500).json({ message: "Lỗi xử lý hồ sơ: " + error.message });
    }
};

export const getDriverPerformance = async (req: AuthRequest, res: Response) => {
    try {
        const { driverId } = req.params;
        const performance = await getDriverPerformanceService(driverId);
        res.status(200).json({
            success: true,
            data: performance
        });
    } catch (error: any) {
        console.error("Get Driver Performance Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
    }
};
