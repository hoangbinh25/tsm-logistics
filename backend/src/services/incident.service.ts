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
    hinhAnh?: string; // Có thể lưu JSON string của danh sách ảnh
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
        await prisma.thongBao.createMany({
            data: admins.map(admin => ({
                id: `TB${genId26()}`, // Tùy vào schema model thông báo, hiện tại ThongBao dùng cuid()
                nguoi_nhan_id: admin.id,
                tieu_de: "Báo cáo sự cố mới!",
                noi_dung: `Tài xế ${suCo.tai_xe.nguoi_dung.ho_ten} vừa báo cáo sự cố: ${loaiSuCo}.`,
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
