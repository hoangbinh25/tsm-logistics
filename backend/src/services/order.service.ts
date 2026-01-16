import prisma from '../config/prisma';
import { genId26 } from '../types/genID';
import { sendDeliverySuccessEmail, sendOrderConfirmationEmail } from '../utils/mailer';
import { Prisma, TrangThaiDonHang } from '@prisma/client';
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

interface GetOrdersParams {
    userId: string;
    role: string;               // 'QUAN_LY' | 'TAI_XE' | 'USER'
    type?: 'active' | 'history'; // active: Đang xử lý, history: Đã xong/Hủy
}

export const getOrdersService = async ({ userId, role, type }: GetOrdersParams) => {
    // 1. Khởi tạo điều kiện lọc
    let whereClause: Prisma.DonHangWhereInput = {};

    // 2. PHÂN QUYỀN (Ai được xem đơn nào?)
    if (role === 'QUAN_LY') {
        // Admin xem được tất cả -> Không cần thêm điều kiện ID
    } else if (role === 'TAI_XE') {
        // Tài xế chỉ xem đơn mình được gán
        whereClause.tai_xe_id = userId;
        const driverProfile = await prisma.taiXeProfile.findUnique({ where: { nguoi_dung_id: userId }});
        if (driverProfile) {
            whereClause.tai_xe_id = driverProfile.id;
        } else {
             // Nếu là tài xế mà chưa có profile -> không thấy đơn nào
            return [];
        }

    } else {
        // Khách hàng (USER) chỉ xem đơn mình đặt
        whereClause.khach_hang_id = userId;
    }

    // 3. LỌC THEO TRẠNG THÁI (Đang chạy vs Lịch sử)
    if (type) {
        const historyStatuses = ['DA_GIAO', 'DA_HUY', 'GIAO_KHONG_THANH_CONG'];
        
        if (type === 'history') {
            // Lấy đơn đã xong
            whereClause.trang_thai_don_hang = { in: historyStatuses as any };
        } else if (type === 'active') {
            // Lấy đơn đang xử lý (Không nằm trong nhóm lịch sử)
            whereClause.trang_thai_don_hang = { notIn: historyStatuses as any };
        }
    }

    // 4. Query Database
    return await prisma.donHang.findMany({
        where: whereClause,
        orderBy: { thoi_gian_tao: 'desc' }, 
        include: {
            khach_hang: true,
            kho_gui: true,
            chi_tiet: true,
            tai_xe: {
                include: {
                    nguoi_dung: {
                        select: { ho_ten: true, so_dien_thoai: true, anh_dai_dien: true }
                    }
                }
            },
            phuong_tien: true 
        }
    });
};

export const getTrackingOrderService = async (code: string, viewerId: string, role: string) => {
    // 1. Tìm đơn hàng trong DB
    const order = await prisma.donHang.findFirst({
        where: { ma_don_hang: code },
        include: {
            kho_gui: true,
            khach_hang: true,
            chi_tiet: true,
            tai_xe: {
                include: { nguoi_dung: { select: { ho_ten: true, so_dien_thoai: true } } }
            },
            phuong_tien: true
        }
    });

    // 2. Kiểm tra tồn tại
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }

    const isAdmin = role === 'QUAN_LY';
    
    // Chủ sở hữu (khach_hang_id trùng với viewerId) được xem
    const isOwner = order.khach_hang_id === viewerId;

    if (!isAdmin && !isOwner) {
        throw new Error("FORBIDDEN");
    }

    return order;
};

export const getOrderByIdService = async (orderId: string) => {
    return await prisma.donHang.findUnique({
        where: { id: orderId },
        include: {
            khach_hang: true, // Lấy thông tin người nhận
            kho_gui: true,    // Lấy kho gửi
            chi_tiet: true,   // Lấy danh sách hàng hóa bên trong
            tai_xe: {         // Lấy thông tin tài xế (nếu cần hiển thị)
                include: { nguoi_dung: { select: { ho_ten: true, so_dien_thoai: true } } }
            },
            phuong_tien: true
        }
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
    const totalPayment = paymentMethod === 'COD' ? (totalPrice + shippingFee) : shippingFee;

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
                tong_thanh_toan: totalPayment,
                
                trang_thai_don_hang: 'TAO_MOI',
                hinh_thuc_thanh_toan: paymentMethod === 'COD' ? 'COD' : 'ONLINE',
                ghi_chu: note,
                thoi_gian_dat: new Date(),
            },
            include: {
                khach_hang: {
                    select: { email: true, ho_ten: true }
                }
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
    if (newOrder.khach_hang?.email) {
        const emailData = {
            ma_don_hang: newOrder.ma_don_hang,
            tong_thanh_toan: newOrder.tong_thanh_toan,
            hinh_thuc_thanh_toan: newOrder.hinh_thuc_thanh_toan,
            // Lấy thông tin người nhận từ params truyền vào
            receiverName: receiverInfo.name,
            receiverPhone: receiverInfo.phone
        };

        // Gọi hàm gửi mail (không await để trả response nhanh hơn)
        sendOrderConfirmationEmail(newOrder.khach_hang.email, emailData)
            .catch(err => console.error("Lỗi gửi mail xác nhận:", err));
    }

    return newOrder;
};

export const autoAssignDriverService = async (orderId: string) => {
    // 1. Lấy thông tin đơn hàng
    const order = await prisma.donHang.findUnique({
        where: { id: orderId },
        include: { kho_gui: true }
    });

    if (!order) throw new Error("Đơn hàng không tồn tại");

    const orderWeight = Number(order.tong_khoi_luong);
    const orderProvince = order.kho_gui.tinh_thanh; // VD: "Hà Nội"

    // 2. Tìm XE phù hợp (Đủ tải + Đang rảnh)
    const suitableVehicle = await prisma.phuongTien.findFirst({
        where: {
            trang_thai: 'SAN_SANG', // Chỉ lấy xe đang rảnh
            tai_trong_toi_da: {
                gte: orderWeight
            }
        },
        orderBy: {
            tai_trong_toi_da: 'asc' // Chọn xe nhỏ nhất vừa đủ để tiết kiệm
        }
    });

    if (!suitableVehicle) {
        throw new Error(`Không tìm thấy xe tải trọng >= ${orderWeight}kg đang sẵn sàng.`);
    }

    // 3. Tìm TÀI XẾ phù hợp (Profile Sẵn sàng + Cùng khu vực)
    const suitableDriverProfile = await prisma.taiXeProfile.findFirst({
        where: {
            trang_thai_cong_tac: 'DANG_HOAT_DONG', 
            nguoi_dung: {
                dia_chi: {
                    contains: orderProvince 
                },
                trang_thai_tai_khoan: 'ACTIVE'
            }
        },
        include: { nguoi_dung: true }
    });

    if (!suitableDriverProfile) {
        throw new Error(`Có xe (${suitableVehicle.bien_kiem_soat}) nhưng không tìm thấy tài xế rảnh tại khu vực ${orderProvince}.`);
    }

    // 4. Thực hiện Phân công (Transaction)
    return await prisma.$transaction(async (tx) => {
        
        // A. Cập nhật Đơn hàng (QUAN TRỌNG NHẤT ĐỂ HIỆN LÊN ADMIN)
        await tx.donHang.update({
            where: { id: orderId },
            data: { 
                tai_xe_id: suitableDriverProfile.id, 
                id: suitableVehicle.id,             
                trang_thai_don_hang: 'DA_PHAN_CONG',
                thoi_gian_cap_nhat: new Date()
            }
        });

        // B. Update Tài xế -> BẬN (Để không bị gán đơn khác)
        await tx.taiXeProfile.update({
            where: { id: suitableDriverProfile.id },
            data: { trang_thai_cong_tac: 'TAM_NGUNG' }
        });

        // C. Update Xe -> HOẠT ĐỘNG
        await tx.phuongTien.update({
            where: { id: suitableVehicle.id },
            data: { trang_thai: 'DANG_VAN_CHUYEN' } 
        });

        // D. Tạo thông báo cho App Tài xế (Để tài xế nhận được tin)
        await tx.thongBao.create({
            data: {
                nguoi_nhan_id: suitableDriverProfile.nguoi_dung_id,
                tieu_de: "Đơn hàng mới (Tự động)!",
                noi_dung: `Bạn vừa được hệ thống gán đơn hàng #${order.ma_don_hang}. Vui lòng kiểm tra.`,
                loai_thong_bao: "ORDER"
            }
        });

        return { 
            message: "Phân công tự động thành công", 
            driver: suitableDriverProfile.nguoi_dung?.ho_ten, 
            vehicle: suitableVehicle.bien_kiem_soat 
        };
    });
};

export const assignOrderService = async (orderId: string, userIdOrDriverId: string, vehicleId: string) => {
    
    // 1. Check đơn hàng
    const order = await prisma.donHang.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Không tìm thấy đơn hàng");

    // 2. LOGIC THÔNG MINH: Tìm ID Tài xế chuẩn
    let finalDriverId = userIdOrDriverId;

    // Kiểm tra xem ID này có tồn tại trong bảng TaiXe không
    const driverExists = await prisma.taiXeProfile.findUnique({ 
        where: { id: userIdOrDriverId } 
    });

    if (!driverExists) {
        // Nếu không phải ID Tài xế, thử tìm xem có phải ID Người dùng không
        const driverByUserId = await prisma.taiXeProfile.findFirst({ 
            where: { nguoi_dung_id: userIdOrDriverId } 
        });

        if (driverByUserId) {
            finalDriverId = driverByUserId.id; // Tìm thấy ID Tài xế thật
        } else {
            throw new Error("Người dùng này chưa đăng ký hồ sơ Tài xế hoặc ID không hợp lệ.");
        }
    }

    // 3. Thực hiện Update với ID chuẩn vừa tìm được
    return await prisma.donHang.update({
        where: { id: orderId },
        data: {
            tai_xe_id: finalDriverId, // Dùng ID chuẩn
            phuong_tien_id: vehicleId,
            trang_thai_don_hang: 'DA_PHAN_CONG',
            thoi_gian_cap_nhat: new Date()
        },
        include: {
            tai_xe: { include: { nguoi_dung: true } },
            phuong_tien: true
        }
    });
};

export const getDriverTasksService = async (userId: string) => {
    const driverProfile = await prisma.taiXeProfile.findUnique({
        where: { nguoi_dung_id: userId }
    });

    // Nếu user này không phải tài xế -> Trả về rỗng hoặc lỗi
    if (!driverProfile) {
        throw new Error("NOT_DRIVER");
    }

    // Lấy các đơn hàng được gán cho Profile ID này
    const tasks = await prisma.donHang.findMany({
        where: {
            tai_xe_id: driverProfile.id, // dùng ID của Profile
            trang_thai_don_hang: {
                // Chỉ lấy các đơn đang cần xử lý
                in: ['DA_PHAN_CONG', 'DANG_VAN_CHUYEN']
            }
        },
        include: {
            kho_gui: true,   // Để lấy địa chỉ lấy hàng
            khach_hang: {    // Để lấy tên/sdt người gửi (nếu cần)
                select: { ho_ten: true, so_dien_thoai: true }
            }
        },
        orderBy: { thoi_gian_tao: 'desc' }
    });

    return tasks;
};

export const getOrderByCodeService = async (code: string) => {
    // Tìm đơn hàng theo mã vận đơn (String)
    const order = await prisma.donHang.findFirst({
        where: { ma_don_hang: code },
        include: {
            kho_gui: true, // Lấy tên kho gửi
        }
    });

    return order;
};

export const updateOrderStatusService = async (orderId: string, newStatus: string) => {
    // 1. Validation Logic
    const validStatuses = ['DANG_LAY_HANG', 'DANG_VAN_CHUYEN', 'DA_GIAO', 'HUY'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error("INVALID_STATUS");
    }

    // 2. Lấy thông tin đơn hàng hiện tại
    const currentOrder = await prisma.donHang.findUnique({ 
        where: { id: orderId }, 
        include: {
            khach_hang: true,
        }
    });

    if (!currentOrder) {
        throw new Error("ORDER_NOT_FOUND");
    }

    // 3. Thực hiện Transaction cập nhật
    await prisma.$transaction(async (tx) => {
        // Cập nhật trạng thái đơn hàng
        await tx.donHang.update({
            where: { id: orderId },
            data: {
                trang_thai_don_hang: newStatus as TrangThaiDonHang,
                thoi_gian_cap_nhat: new Date(),
                // Nếu là ĐÃ GIAO thì cập nhật thời gian hoàn thành
                ...(newStatus === 'DA_GIAO' && { thoi_gian_hoan_thanh: new Date() })
            }
        });

        // Logic mở khóa Tài xế & Xe (Nếu đơn hoàn thành hoặc hủy)
        if (newStatus === 'DA_GIAO' || newStatus === 'HUY') {
            // Mở khóa tài xế
            if (currentOrder.tai_xe_id) {
                await tx.taiXeProfile.update({
                    where: { id: currentOrder.tai_xe_id },
                    data: { trang_thai_cong_tac: 'DANG_HOAT_DONG' } 
                });
            }
            if (currentOrder.phuong_tien_id) {
                await tx.phuongTien.update({
                    where: { id: currentOrder.phuong_tien_id },
                    data: { trang_thai: 'SAN_SANG' } 
                });
            }
        }
        if(newStatus === 'DA_GIAO' && currentOrder.khach_hang?.email) {
            sendDeliverySuccessEmail(
                currentOrder.khach_hang.email,
                currentOrder.ma_don_hang,
                currentOrder.khach_hang.ho_ten || "Quý khách"
            );
        }
    });

    return { success: true };
};