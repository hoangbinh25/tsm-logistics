import prisma from '../config/prisma';
import { genId26 } from '../types/genID';
interface CreateOrderParams {
    userId: string;
    senderAddress: string;
    receiverInfo: { name: string; phone: string; address: string };
    warehouseId: string;
    serviceId: string;
    paymentMethod: string; // "COD", "CHUYEN_KHUOAN"
    note: string;
    items: any[];
}

export const getMyOrdersService = async (userId: string) => {
    return await prisma.donHang.findMany({
        where: {
            khach_hang_id: userId 
        },
        orderBy: {
            thoi_gian_dat: 'desc'
        },
        include: {
            chi_tiet: true        // chi tiết đơn hàng
        }
    });
};

export const getAllOrdersService = async () => {
    return await prisma.donHang.findMany({
        include: {
            khach_hang: true, 
            kho_gui: true,    
            
            tai_xe: {
                include: {
                    nguoi_dung: { 
                        select: { 
                            ho_ten: true, 
                            so_dien_thoai: true, 
                            anh_dai_dien: true 
                        }
                    }
                }
            }
        },
        orderBy: { thoi_gian_tao: 'desc' } // Sắp xếp mới nhất lên đầu
    });
};

export const createOrderService = async (params: CreateOrderParams) => {
    const { userId, senderAddress, receiverInfo, warehouseId, serviceId, paymentMethod, note, items } = params;

    // 1. Tính toán tổng quan
    let totalWeight = 0;
    let totalPrice = 0;

    // Duyệt qua items để tính tổng
    items.forEach(item => {
        totalWeight += Number(item.khoi_luong || 0);
        totalPrice += Number(item.don_gia || 0) * Number(item.so_luong || 1);
    });

    // 2. Tính phí vận chuyển
    // Ví dụ: 30k cơ bản + 5k cho mỗi kg
    const shippingFee = 30000 + (totalWeight * 5000);
    const totalPayment = shippingFee; // Nếu người nhận trả ship. Nếu COD tiền hàng thì cộng thêm totalPrice.

    // 3. Tạo mã vận đơn tự động (VD: VNP + Timestamp cắt gọn)
    const orderCode = `DH${Date.now().toString().slice(-8)}`;

    // 4. Thực hiện Transaction lưu DB
    const newOrder = await prisma.$transaction(async (tx) => {
        // A. Tạo đơn hàng
        const orderId = genId26();
        
        const order = await tx.donHang.create({
            data: {
                id: orderId,
                ma_don_hang: orderCode,
                khach_hang_id: userId,
                nguoi_tao_id: userId, 
                kho_gui_id: warehouseId,
                // kho_nhan_id: null, // Chưa biết kho nhận lúc tạo
                dia_chi_giao: senderAddress,
                dia_chi_nhan: `${receiverInfo.name} - ${receiverInfo.phone} - ${receiverInfo.address}`,
                
                tong_khoi_luong: totalWeight,
                tong_tien_hang: totalPrice,
                phi_van_chuyen: shippingFee,
                giam_gia: 0,
                tong_thanh_toan: paymentMethod === 'COD' ? (totalPrice + shippingFee) : shippingFee,
                
                trang_thai_don_hang: 'TAO_MOI',
                hinh_thuc_thanh_toan: paymentMethod === 'COD' ? 'COD' : 'ONLINE',
                ghi_chu: note,
                thoi_gian_dat: new Date(),
            }
        });

        // B. Tạo chi tiết đơn hàng (Mapping items từ FE sang DB Schema)
        if (items.length > 0) {
            await tx.chiTietDonHang.createMany({
                data: items.map(item => ({
                    id: genId26(),
                    don_hang_id: orderId,
                    ma_dich_vu: serviceId,
                    ten_hang_hoa: item.ten_hang,
                    mo_ta: item.mo_ta || "",
                    so_luong: Number(item.so_luong),
                    don_vi_tinh: item.don_vi || "Cái",
                    khoi_luong: Number(item.khoi_luong),
                    don_gia: Number(item.don_gia),
                    thanh_tien: Number(item.don_gia) * Number(item.so_luong)
                }))
            });
        }

        return order;
    });

    return newOrder;
};

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