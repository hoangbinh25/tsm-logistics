import prisma from '../config/prisma';
import { genId26 } from '../types/genID';

export const registerScheduleService = async (userId: string, dates: { date: string, shift?: string, note?: string }[]) => {
    const driverProfile: any = await prisma.taiXeProfile.findFirst({
        where: { nguoi_dung_id: userId }
    });

    if (!driverProfile) {
        throw new Error("Không tìm thấy hồ sơ tài xế");
    }

    const results = [];

    for (const d of dates) {
        const ngayLamViec = d.date; // Use string for Raw SQL to avoid date formatting issues

        // Dùng Raw SQL để tránh lỗi Prisma Client chưa update
        const existing: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM LichLamViec WHERE tai_xe_id = ? AND ngay_lam_viec = ?`,
            driverProfile.id, ngayLamViec
        );

        if (existing.length > 0) {
            await prisma.$executeRawUnsafe(
                `UPDATE LichLamViec SET ca_lam_viec = ?, ghi_chu = ?, trang_thai = ?, thoi_gian_cap_nhat = NOW() WHERE id = ?`,
                d.shift || existing[0].ca_lam_viec, d.note || existing[0].ghi_chu, "CHO_DUYET", existing[0].id
            );
        } else {
            const id = genId26();
            await prisma.$executeRawUnsafe(
                `INSERT INTO LichLamViec (id, tai_xe_id, ngay_lam_viec, ca_lam_viec, ghi_chu, trang_thai, thoi_gian_tao, thoi_gian_cap_nhat) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                id, driverProfile.id, ngayLamViec, d.shift || "CA_NGAY", d.note || "", "CHO_DUYET"
            );
        }
    }

    return { message: "Đã đăng ký thành công" };
};

export const getDriverSchedulesService = async (userId: string) => {
    const driverProfile: any = await prisma.taiXeProfile.findFirst({
        where: { nguoi_dung_id: userId }
    });

    if (!driverProfile) return [];

    // Dùng Raw SQL để lấy lịch
    return await prisma.$queryRawUnsafe(
        `SELECT * FROM LichLamViec WHERE tai_xe_id = ? ORDER BY ngay_lam_viec ASC`,
        driverProfile.id
    );
};

export const getAllSchedulesService = async () => {
    // Phối hợp giữa Prisma và Raw SQL
    const rawSchedules: any[] = await prisma.$queryRawUnsafe(
        `SELECT s.*, u.ho_ten, u.so_dien_thoai 
         FROM LichLamViec s
         JOIN TaiXeProfile t ON s.tai_xe_id = t.id
         JOIN NguoiDung u ON t.nguoi_dung_id = u.id
         ORDER BY s.ngay_lam_viec DESC`
    );
    return rawSchedules;
};

export const updateScheduleStatusService = async (id: string, status: string) => {
    return await prisma.$executeRawUnsafe(
        `UPDATE LichLamViec SET trang_thai = ?, thoi_gian_cap_nhat = NOW() WHERE id = ?`,
        status, id
    );
};
