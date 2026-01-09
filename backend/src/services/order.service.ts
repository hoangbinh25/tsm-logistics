import prisma from '../config/prisma';
import { genId26 } from '../types/genId';

export const autoAssignDriverService = async (orderId: string) => {
    // 1. Lấy thông tin đơn hàng để biết: Kho gửi ở đâu? Nặng bao nhiêu?
    const order = await prisma.donHang.findUnique({
        where: { id: orderId },
        include: { kho_gui: true }
    });

    if (!order) throw new Error("Đơn hàng không tồn tại");

    // Ép kiểu Decimal sang Number để so sánh
    const orderWeight = Number(order.tong_khoi_luong);
    const orderProvince = order.kho_gui.tinh_thanh; // VD: "Hà Nội"

    // 2. Tìm XE phù hợp (Đủ tải + Đang rảnh)
    const suitableVehicle = await prisma.phuongTien.findFirst({
        where: {
            trang_thai: 'SAN_SANG',
            tai_trong_toi_da: {
                gte: orderWeight // Tải trọng xe >= Khối lượng hàng
            }
        },
        orderBy: {
            tai_trong_toi_da: 'asc' // Ưu tiên chọn xe nhỏ nhất vừa đủ (tiết kiệm chi phí)
        }
    });

    if (!suitableVehicle) {
        throw new Error(`Không tìm thấy xe nào tải trọng >= ${orderWeight}kg đang sẵn sàng.`);
    }

    // 3. Tìm TÀI XẾ phù hợp (Cùng khu vực + Đang rảnh)
    const suitableDriver = await prisma.nguoiDung.findFirst({
        where: {
            vai_tro: 'TAI_XE',
            trang_thai_tai_khoan: 'ACTIVE',
            dia_chi: {
                contains: orderProvince
            },
            // Đảm bảo tài xế chưa nhận đơn nào khác (đang rảnh)
            phan_cong_tai_xe: {
                none: {
                    trang_thai_phan_cong: { in: ['MOI', 'DA_XAC_NHAN', 'DANG_THUC_HIEN'] }
                }
            }
        }
    });

    if (!suitableDriver) {
        throw new Error(`Có xe (${suitableVehicle.bien_kiem_soat}) nhưng không tìm thấy tài xế nào ở khu vực ${orderProvince} đang rảnh.`);
    }

    // 4. Thực hiện Phân công (Transaction)
    return await prisma.$transaction(async (tx) => {
        // Cập nhật đơn hàng
        await tx.donHang.update({
            where: { id: orderId },
            data: { trang_thai_don_hang: 'DA_PHAN_CONG' }
        });

        // Tạo bản ghi phân công
        await tx.phanCongDonHang.create({
            data: {
                id: genId26(),
                don_hang_id: orderId,
                tai_xe_id: suitableDriver.id,
                phuong_tien_id: suitableVehicle.id,
                thoi_gian_phan_cong: new Date(),
                thoi_gian_ket_thuc_du_kien: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 ngày
                trang_thai_phan_cong: 'MOI'
            }
        });

        // Cập nhật xe thành bận
        await tx.phuongTien.update({
            where: { id: suitableVehicle.id },
            data: { trang_thai: 'DANG_VAN_CHUYEN' }
        });

        return { 
            message: "Phân công tự động thành công", 
            driver: suitableDriver.ho_ten, 
            vehicle: suitableVehicle.bien_kiem_soat 
        };
    });
};