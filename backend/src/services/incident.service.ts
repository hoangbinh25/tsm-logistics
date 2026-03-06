import prisma from '../config/prisma';
import { genId26 } from '../types/genID';
import { LoaiSuCo, TrangThaiSuCo } from '@prisma/client';

export interface ReportIncidentParams {
    userId: string;
    donHangId?: string;
    phuongTienId?: string;
    loaiSuCo: LoaiSuCo;
    moTa: string;
    viTri?: string;
    hinhAnh?: string;
}

export const reportIncidentService = async (params: ReportIncidentParams) => {
    const { userId, donHangId, phuongTienId, loaiSuCo, moTa, viTri, hinhAnh } = params;

    // 1. Tìm driver profile từ userId
    const driverProfile = await prisma.taiXeProfile.findUnique({
        where: { nguoi_dung_id: userId }
    });

    if (!driverProfile) {
        throw new Error("Không tìm thấy hồ sơ tài xế");
    }

    // 2. Nếu có donHangId, kiểm tra trạng thái đơn hàng
    if (donHangId) {
        const order = await prisma.donHang.findUnique({
            where: { id: donHangId }
        });

        if (!order) {
            throw new Error("Không tìm thấy đơn hàng để báo cáo sự cố");
        }

        if (order.trang_thai_don_hang === 'DA_GIAO') {
            throw new Error("Đơn hàng này đã giao thành công. Không thể báo cáo sự cố vào thời điểm này.");
        }

        if (order.trang_thai_don_hang === 'DA_HUY' || order.trang_thai_don_hang === 'GIAO_KHONG_THANH_CONG') {
            throw new Error("Đơn hàng đã kết thúc hoặc bị hủy, không thể báo cáo sự cố.");
        }
    }

    // 2. Tạo sự cố trong DB
    const suCo = await prisma.suCo.create({
        data: {
            id: genId26(),
            tai_xe_id: driverProfile.id,
            don_hang_id: donHangId || null,
            phuong_tien_id: phuongTienId || null,
            loai_su_co: loaiSuCo,
            mo_ta: moTa,
            vi_tri: viTri || "",
            hinh_anh: hinhAnh || "",
            trang_thai: 'MOI'
        },
        include: {
            tai_xe: {
                include: {
                    nguoi_dung: { select: { ho_ten: true, so_dien_thoai: true } }
                }
            },
            don_hang: true,
            phuong_tien: true
        }
    });

    // 3. Tạo thông báo cho Admin (QUAN_LY)
    const admins = await prisma.nguoiDung.findMany({
        where: { vai_tro: 'QUAN_LY' },
        select: { id: true }
    });

    if (admins.length > 0) {
        const driverName = suCo.tai_xe?.nguoi_dung?.ho_ten || "Tài xế";
        await prisma.thongBao.createMany({
            data: admins.map(admin => ({
                nguoi_nhan_id: admin.id,
                tieu_de: "Báo cáo sự cố mới!",
                noi_dung: `Tài xế ${driverName} vừa báo cáo sự cố: ${loaiSuCo}.`,
                loai_thong_bao: "INCIDENT"
            }))
        });
    }

    return suCo;
};

export const getIncidentsService = async (role: string, userId: string) => {
    if (role === 'QUAN_LY') {
        return await prisma.suCo.findMany({
            orderBy: { thoi_gian_tao: 'desc' },
            include: {
                tai_xe: { include: { nguoi_dung: true } },
                don_hang: true,
                phuong_tien: true
            }
        });
    } else {
        const driverProfile = await prisma.taiXeProfile.findUnique({
            where: { nguoi_dung_id: userId }
        });
        if (!driverProfile) return [];
        return await prisma.suCo.findMany({
            where: { tai_xe_id: driverProfile.id },
            orderBy: { thoi_gian_tao: 'desc' },
            include: {
                don_hang: true,
                phuong_tien: true
            }
        });
    }
};

export const updateIncidentStatusService = async (id: string, status: TrangThaiSuCo, ghiChu?: string) => {
    return await prisma.suCo.update({
        where: { id },
        data: {
            trang_thai: status,
            ghi_chu_quan_ly: ghiChu
        }
    });
};
