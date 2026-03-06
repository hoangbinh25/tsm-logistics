import prisma from '../config/prisma';
import { genId26 } from '../types/genID';
import { sendDeliverySuccessEmail, sendOrderConfirmationEmail } from '../utils/mailer';
import { HinhThucThanhToan, Prisma, TrangThaiDonHang } from '@prisma/client';
import { checkMaintenanceAndNotify } from './fleet.service';

interface GetOrdersParams {
    userId: string;
    role: string;               // 'QUAN_LY' | 'TAI_XE' | 'USER'
    type?: 'active' | 'history';
}

export interface CreateOrderParams {
    userId: string;
    senderAddress: string;
    receiverInfo: { name: string; phone: string; address: string };
    warehouseId: string;
    serviceId: string;
    paymentMethod: string;
    payer: string; // SENDER | RECEIVER
    note?: string;
    items: any[];
}
interface CreateOrderResult {
    order: any;
}

export const createOrderService = async (params: CreateOrderParams): Promise<CreateOrderResult> => {
    const { userId, senderAddress, receiverInfo, warehouseId, serviceId, paymentMethod, payer, note, items } = params;

    // --- BƯỚC 0: FETCH MASTER DATA ---
    const [warehouse, service] = await Promise.all([
        prisma.khoHang.findUnique({ where: { id: warehouseId } }),
        prisma.dichVuVanChuyen.findUnique({ where: { id: serviceId } })
    ]);

    if (!warehouse) throw new Error("Kho hàng không tồn tại: " + warehouseId);
    if (!service) throw new Error("Dịch vụ không tồn tại: " + serviceId);

    // --- BƯỚC 1: TÍNH TOÁN TỔNG QUAN ---
    let totalWeight = 0;
    let totalPrice = 0;

    items.forEach((item: any) => {
        const weight = Number(item.khoi_luong || item.weight || 0);
        const price = Number(item.don_gia || item.value || item.gia_tri || 0);
        const qty = Number(item.so_luong || item.quantity || 1);

        totalWeight += weight;
        totalPrice += price * qty;
    });

    const basePrice = Number(service.gia_co_ban);
    const shippingFee = basePrice + (totalWeight * 2000);
    const totalPayment = totalPrice + shippingFee;
    const totalCod = items.reduce((sum: number, item: any) => sum + Number(item.tien_cod || item.codAmount || 0), 0);

    // Sinh mã vận đơn ngẫu nhiên và an toàn hơn
    const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderCode = `DH${Date.now().toString().slice(-6)}${randStr}`;

    // --- BƯỚC 2: TRANSACTION LƯU DB ---
    try {
        const newOrder = await prisma.$transaction(async (tx) => {
            const orderId = genId26();

            const order = await tx.donHang.create({
                data: {
                    id: orderId,
                    ma_don_hang: orderCode,
                    khach_hang_id: userId,
                    nguoi_tao_id: userId,
                    kho_gui_id: warehouseId,
                    dia_chi_giao: senderAddress || "Chưa xác định",
                    dia_chi_nhan: `${receiverInfo.name} - ${receiverInfo.phone} - ${receiverInfo.address}`,

                    tong_khoi_luong: totalWeight,
                    tong_tien_hang: totalPrice,
                    phi_van_chuyen: shippingFee,
                    giam_gia: 0,
                    tong_thanh_toan: totalPayment,

                    trang_thai_don_hang: 'TAO_MOI',
                    hinh_thuc_thanh_toan: (paymentMethod || 'COD') as HinhThucThanhToan,
                    nguoi_thanh_toan: payer === 'RECEIVER' ? 'NGUOI_NHAN' : 'NGUOI_GUI',
                    tien_cod: totalCod,
                    ghi_chu: note || "",
                    thoi_gian_dat: new Date(),
                },
                include: {
                    khach_hang: { select: { email: true, ho_ten: true } },
                    kho_gui: true
                }
            });

            if (items.length > 0) {
                await tx.chiTietDonHang.createMany({
                    data: items.map((item: any) => {
                        const price = Number(item.don_gia || item.value || item.gia_tri || 0);
                        const qty = Number(item.so_luong || item.quantity || 1);
                        return {
                            id: genId26(),
                            don_hang_id: orderId,
                            ma_dich_vu: serviceId,
                            ten_hang_hoa: item.ten_hang || item.ten_hang_hoa || item.name || "Hàng hóa",
                            mo_ta: item.mo_ta || "",
                            so_luong: qty,
                            don_vi_tinh: item.don_vi || item.don_vi_tinh || "Kiện",
                            khoi_luong: Number(item.khoi_luong || item.weight || 0),
                            don_gia: price,
                            thanh_tien: price * qty,
                            kich_thuoc: item.kich_thuoc || ""
                        }
                    })
                });
            }

            return order;
        });

        // --- BƯỚC 4: GỬI MAIL ---
        if (newOrder.khach_hang?.email && paymentMethod === 'COD') {
            const emailData = {
                ma_don_hang: newOrder.ma_don_hang,
                tong_thanh_toan: newOrder.tong_thanh_toan,
                hinh_thuc_thanh_toan: newOrder.hinh_thuc_thanh_toan,
                receiverName: receiverInfo.name,
                receiverPhone: receiverInfo.phone
            };
            sendOrderConfirmationEmail(newOrder.khach_hang.email, emailData).catch(e => console.error("📧 Lỗi gửi mail:", e));
        }

        return { order: newOrder };

    } catch (dbError: any) {
        console.error("CRITICAL: Create Order DB Error:", dbError);
        throw new Error(`Lỗi lưu đơn hàng: ${dbError.message}`);
    }
};

export const getOrdersService = async ({ userId, role, type }: GetOrdersParams) => {
    // 1. Khởi tạo điều kiện lọc
    let whereClause: Prisma.DonHangWhereInput = {};

    // 2. PHÂN QUYỀN (Ai được xem đơn nào?)
    if (role === 'QUAN_LY') {
        // Admin xem được tất cả -> Không cần thêm điều kiện ID
    } else if (role === 'TAI_XE') {
        // Tài xế chỉ xem đơn mình được gán
        whereClause.tai_xe_id = userId;
        const driverProfile = await prisma.taiXeProfile.findUnique({ where: { nguoi_dung_id: userId } });
        if (driverProfile) {
            whereClause.tai_xe_id = driverProfile.id;
        } else {
            // Nếu là tài xế mà ch ưa có profile -> không thấy đơn nào
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
            phuong_tien: true,
            thanh_toan: { take: 1, orderBy: { thoi_gian_tao: 'desc' } },
            su_co: true
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
            phuong_tien: true,
            thanh_toan: { take: 1, orderBy: { thoi_gian_tao: 'desc' } },
            su_co: true
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
            khach_hang: true,
            kho_gui: true,
            chi_tiet: true,
            tai_xe: {
                include: { nguoi_dung: { select: { ho_ten: true, so_dien_thoai: true } } }
            },
            phuong_tien: true,
            thanh_toan: { take: 1, orderBy: { thoi_gian_tao: 'desc' } },
            su_co: true
        }
    });
};

const isCompatible = (license: string | null | undefined, weight: number, vehicleType: string | null | undefined) => {
    if (!license) return false;
    const l = license.toUpperCase();

    if (vehicleType?.toLowerCase().includes("đầu kéo") || weight >= 15000) {
        return l === "FC";
    }

    if (weight >= 3500) {
        return ["C", "D", "E", "FC"].includes(l);
    }

    return ["B2", "C", "D", "E", "FC"].includes(l);
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

    // 2. Tìm XE rảnh đủ tải
    const suitableVehicles = await prisma.phuongTien.findMany({
        where: {
            trang_thai: 'SAN_SANG',
            tai_trong_toi_da: { gte: orderWeight }
        },
        orderBy: { tai_trong_toi_da: 'asc' }
    });

    if (suitableVehicles.length === 0) {
        throw new Error(`Không tìm thấy xe tải trọng >= ${orderWeight}kg đang sẵn sàng.`);
    }

    // 3. Tìm TÀI XẾ rảnh cùng khu vực
    const suitableDrivers = await prisma.taiXeProfile.findMany({
        where: {
            trang_thai_cong_tac: 'DANG_HOAT_DONG',
            nguoi_dung: {
                dia_chi: { contains: orderProvince },
                trang_thai_tai_khoan: 'ACTIVE'
            }
        },
        include: { nguoi_dung: true }
    });

    if (suitableDrivers.length === 0) {
        throw new Error(`Không tìm thấy tài xế rảnh tại khu vực ${orderProvince}.`);
    }

    // 4. Tìm cặp Tài xế & Phương tiện Tương thích Hạng Bằng
    let assignedVehicle = null;
    let assignedDriverProfile = null;

    for (const vehicle of suitableVehicles) {
        for (const driver of suitableDrivers) {
            if (isCompatible(driver.hang_bang_lai, Number(vehicle.tai_trong_toi_da), vehicle.loai_phuong_tien)) {
                assignedVehicle = vehicle;
                assignedDriverProfile = driver;
                break;
            }
        }
        if (assignedVehicle) break;
    }

    if (!assignedVehicle || !assignedDriverProfile) {
        throw new Error(`Có xe và có tài xế nhưng không có cặp nào tương thích hạng bằng lái.`);
    }

    // 5. Thực hiện Phân công (Transaction)
    return await prisma.$transaction(async (tx) => {

        // A. Cập nhật Đơn hàng
        await tx.donHang.update({
            where: { id: orderId },
            data: {
                tai_xe_id: assignedDriverProfile.id,
                phuong_tien_id: assignedVehicle.id,
                trang_thai_don_hang: 'DA_PHAN_CONG',
                thoi_gian_cap_nhat: new Date()
            }
        });

        // B. Update Tài xế -> BẬN
        await tx.taiXeProfile.update({
            where: { id: assignedDriverProfile.id },
            data: { trang_thai_cong_tac: 'TAM_NGUNG' }
        });

        // C. Update Xe -> HOẠT ĐỘNG
        await tx.phuongTien.update({
            where: { id: assignedVehicle.id },
            data: { trang_thai: 'DANG_VAN_CHUYEN' }
        });

        // D. Tạo thông báo cho App Tài xế
        await tx.thongBao.create({
            data: {
                nguoi_nhan_id: assignedDriverProfile.nguoi_dung_id,
                tieu_de: "Đơn hàng mới (Tự động)!",
                noi_dung: `Bạn vừa được hệ thống gán đơn hàng #${order.ma_don_hang}. Xe: ${assignedVehicle.bien_kiem_soat}. Vui lòng kiểm tra.`,
                loai_thong_bao: "ORDER"
            }
        });

        return {
            message: "Phân công tự động thành công",
            driver: assignedDriverProfile.nguoi_dung?.ho_ten,
            vehicle: assignedVehicle.bien_kiem_soat
        };
    });
};

export const assignOrderService = async (orderId: string, userIdOrDriverId: string, vehicleId: string) => {

    // 1. Check đơn hàng
    const order = await prisma.donHang.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Không tìm thấy đơn hàng");

    // 2. Tìm ID Tài xế chuẩn
    let finalDriverId = userIdOrDriverId;
    let driverRef: any = null;

    // Kiểm tra xem ID này có tồn tại trong bảng TaiXe không
    const driverExists = await prisma.taiXeProfile.findUnique({
        where: { id: userIdOrDriverId }
    });
    driverRef = driverExists;

    if (!driverExists) {
        const driverByUserId = await prisma.taiXeProfile.findFirst({
            where: { nguoi_dung_id: userIdOrDriverId }
        });

        if (driverByUserId) {
            finalDriverId = driverByUserId.id;
            driverRef = driverByUserId;
        } else {
            throw new Error("Người dùng này chưa đăng ký hồ sơ Tài xế hoặc ID không hợp lệ.");
        }
    }

    // 3. Kiểm tra tính tương thích hạng bằng lái
    const vehicle = await prisma.phuongTien.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new Error("Không tìm thấy phương tiện.");

    if (!isCompatible(driverRef.hang_bang_lai, Number(vehicle.tai_trong_toi_da), vehicle.loai_phuong_tien)) {
        throw new Error(`Hạng bằng lái ${driverRef.hang_bang_lai} của tài xế không đủ điều kiện điều khiển phương tiện này.`);
    }

    // 4. Thực hiện Update với ID chuẩn vừa tìm được
    return await prisma.donHang.update({
        where: { id: orderId },
        data: {
            tai_xe_id: finalDriverId,
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
            khach_hang: {    // Để lấy tên/sdt người gửi
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
    const validStatuses = ['TAO_MOI', 'CHO_XAC_NHAN', 'DA_PHAN_CONG', 'DANG_LAY_HANG', 'DANG_VAN_CHUYEN', 'DA_GIAO', 'HUY'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error("INVALID_STATUS");
    }

    // 2. Lấy thông tin đơn hàng hiện tại
    const currentOrder = await prisma.donHang.findUnique({
        where: { id: orderId },
        include: {
            khach_hang: true,
            kho_gui: true,
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

        if (newStatus === 'DA_GIAO') {
            // Gửi mail thành công
            if (currentOrder.khach_hang?.email) {
                sendDeliverySuccessEmail(
                    currentOrder.khach_hang.email,
                    currentOrder.ma_don_hang,
                    currentOrder.khach_hang.ho_ten || "Quý khách"
                ).catch(err => console.error("Email error:", err));
            }

            // Tăng KM cho xe & Cập nhật vị trí cuối
            if (currentOrder.phuong_tien_id) {
                const randomKm = Math.floor(Math.random() * (150 - 20 + 1)) + 20;
                await tx.phuongTien.update({
                    where: { id: currentOrder.phuong_tien_id },
                    data: {
                        so_km_da_di: { increment: randomKm },
                        vi_tri_hien_tai: currentOrder.dia_chi_giao
                    }
                });
            }
        }

        // Mô phỏng vị trí khi đang vận chuyển
        if (newStatus === 'DANG_VAN_CHUYEN' && currentOrder.phuong_tien_id) {
            await tx.phuongTien.update({
                where: { id: currentOrder.phuong_tien_id },
                data: {
                    vi_tri_hien_tai: `Đang di chuyển đến: ${currentOrder.dia_chi_giao}`
                }
            });
        }

        // Mô phỏng vị trí khi đang lấy hàng (Tại kho)
        if (newStatus === 'DANG_LAY_HANG' && currentOrder.phuong_tien_id) {
            await tx.phuongTien.update({
                where: { id: currentOrder.phuong_tien_id },
                data: {
                    vi_tri_hien_tai: `Tại kho: ${currentOrder.kho_gui?.ten_kho || 'Kho gửi'}`
                }
            });
        }
    });

    if (newStatus === 'DA_GIAO' || newStatus === 'HUY') {
        checkMaintenanceAndNotify().catch(err => console.error("Maintenance check error:", err));
    }

    return { success: true };
};

export const cancelOrderService = async (orderId: string, userId: string) => {
    // 1. Get the order
    const order = await prisma.donHang.findUnique({
        where: { id: orderId }
    });

    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }

    // 2. Check ownership
    if (order.khach_hang_id !== userId) {
        throw new Error("FORBIDDEN");
    }

    // 3. Check if cancelable
    const uncancelableStatuses = ['DA_GIAO', 'DA_HUY', 'GIAO_KHONG_THANH_CONG', 'DANG_LAY_HANG', 'DANG_VAN_CHUYEN'];
    if (uncancelableStatuses.includes(order.trang_thai_don_hang)) {
        throw new Error("STATUS_NOT_CANCELABLE");
    }

    // 4. Update status and free resources
    await prisma.$transaction(async (tx) => {
        await tx.donHang.update({
            where: { id: orderId },
            data: {
                trang_thai_don_hang: 'DA_HUY',
                thoi_gian_cap_nhat: new Date()
            }
        });

        // Mở khóa tài xế
        if (order.tai_xe_id) {
            await tx.taiXeProfile.update({
                where: { id: order.tai_xe_id },
                data: { trang_thai_cong_tac: 'DANG_HOAT_DONG' }
            });
        }

        // Mở khóa phương tiện
        if (order.phuong_tien_id) {
            await tx.phuongTien.update({
                where: { id: order.phuong_tien_id },
                data: { trang_thai: 'SAN_SANG' }
            });
        }
    });

    checkMaintenanceAndNotify().catch(err => console.error("Maintenance check error:", err));

    return { success: true };
};