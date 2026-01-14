import { TrangThaiDuyetTaiXe } from '@prisma/client';
import prisma from '../config/prisma';
import { genId26 } from '../types/genID';

// Định nghĩa kiểu dữ liệu đầu vào cho hàm đăng ký
interface RegisterDriverParams {
    userId: string;
    so_gplx: string;
    hang_bang: string;
    kinh_nghiem: number;
    ngay_het_han: Date;
    frontLicenseUrl: string; // URL ảnh mặt trước
    backLicenseUrl: string;  // URL ảnh mặt sau
}

export const registerDriverService = async (params: RegisterDriverParams) => {
    const { userId, so_gplx, hang_bang, kinh_nghiem, ngay_het_han, frontLicenseUrl, backLicenseUrl } = params;

    // 1. Kiểm tra Business Logic: User đã có hồ sơ chưa?
    const existingProfile = await prisma.taiXeProfile.findUnique({
        where: { nguoi_dung_id: userId }
    });

    if (existingProfile) {
        throw new Error("PROFILE_EXISTS"); // Ném lỗi để Controller bắt
    }

    // 2. Thực hiện Transaction lưu DB
    return await prisma.$transaction(async (tx) => {
        const profileId = genId26();

        // A. Tạo Profile
        const newProfile = await tx.taiXeProfile.create({
            data: {
                id: profileId,
                nguoi_dung_id: userId,
                so_giay_phep_lai_xe: so_gplx,
                hang_bang_lai: hang_bang,
                kinh_nghiem_nam: kinh_nghiem,
                ngay_het_han_gplx: ngay_het_han,
                trang_thai_cong_tac: 'TAM_NGUNG',
                trang_thai_duyet: 'PENDING'
            }
        });

        // B. Tạo Giấy tờ (Mapping chính xác)
        const giayToData = [
            {
                id: genId26(),
                tai_xe_id: profileId,
                loai: 'GPLX_MAT_TRUOC',
                file_url: frontLicenseUrl,
                trang_thai: 'PENDING'
            },
            {
                id: genId26(),
                tai_xe_id: profileId,
                loai: 'GPLX_MAT_SAU',
                file_url: backLicenseUrl,
                trang_thai: 'PENDING'
            }
        ];

        await tx.taiXeGiayTo.createMany({
            data: giayToData as any
        });

        return newProfile;
    });
};

// 1. Logic Lấy danh sách tài xế
export const getAllDriversService = async (status?: string) => {
    const whereCondition = status 
        ? { trang_thai_duyet: status as TrangThaiDuyetTaiXe } 
        : {};

    return await prisma.taiXeProfile.findMany({
        where: whereCondition,
        include: {
            nguoi_dung: {
                select: { ho_ten: true, email: true, so_dien_thoai: true, anh_dai_dien: true }
            },
            giay_to: true // Lấy danh sách ảnh
        },
        orderBy: { thoi_gian_tao: 'desc' }
    });
};

// 2. Logic Duyệt / Từ chối hồ sơ
export const verifyDriverService = async (driverId: string, status: string, reason?: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Cập nhật Profile
        const updatedProfile = await tx.taiXeProfile.update({
            where: { id: driverId },
            data: {
                trang_thai_duyet: status as any, // 'APPROVED' hoặc 'REJECTED'
                ly_do_tu_choi: status === 'REJECTED' ? reason : null,
                thoi_gian_duyet: new Date()
            }
        });

        // 2. Nếu Duyệt -> Update Role User + Update Giấy tờ
        if (status === 'APPROVED') {
            await tx.nguoiDung.update({
                where: { id: updatedProfile.nguoi_dung_id },
                data: { vai_tro: 'TAI_XE' }
            });
            await tx.taiXeGiayTo.updateMany({
                where: { tai_xe_id: driverId },
                data: { trang_thai: 'ACCEPTED' } 
            });
        }

        return updatedProfile;
    });
};