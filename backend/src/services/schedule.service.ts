import prisma from '../config/prisma';
import { genId26 } from '../types/genID';

export const registerScheduleService = async (userId: string, dates: { date: string, shift?: string, note?: string }[]) => {
    const driverProfile = await prisma.taiXeProfile.findUnique({
        where: { nguoi_dung_id: userId }
    });

    if (!driverProfile) {
        throw new Error("Không tìm thấy hồ sơ tài xế");
    }

    const results = [];

    for (const d of dates) {
        const ngayLamViec = new Date(d.date);

        // Kiểm tra xem đã đăng ký ngày này chưa
        const existing = await prisma.lichLamViec.findUnique({
            where: {
                tai_xe_id_ngay_lam_viec: {
                    tai_xe_id: driverProfile.id,
                    ngay_lam_viec: ngayLamViec
                }
            }
        });

        if (existing) {
            // Cập nhật nếu đã có (hoặc có thể bỏ qua tùy logic)
            const updated = await prisma.lichLamViec.update({
                where: { id: existing.id },
                data: {
                    ca_lam_viec: d.shift || existing.ca_lam_viec,
                    ghi_chu: d.note || existing.ghi_chu,
                    trang_thai: "CHO_DUYET"
                }
            });
            results.push(updated);
        } else {
            // Tạo mới
            const created = await prisma.lichLamViec.create({
                data: {
                    id: genId26(),
                    tai_xe_id: driverProfile.id,
                    ngay_lam_viec: ngayLamViec,
                    ca_lam_viec: d.shift || "CA_NGAY",
                    ghi_chu: d.note || "",
                    trang_thai: "CHO_DUYET"
                }
            });
            results.push(created);
        }
    }

    return results;
};

export const getDriverSchedulesService = async (userId: string) => {
    const driverProfile = await prisma.taiXeProfile.findUnique({
        where: { nguoi_dung_id: userId }
    });

    if (!driverProfile) return [];

    return await prisma.lichLamViec.findMany({
        where: { tai_xe_id: driverProfile.id },
        orderBy: { ngay_lam_viec: 'asc' }
    });
};

export const getAllSchedulesService = async () => {
    return await prisma.lichLamViec.findMany({
        orderBy: { ngay_lam_viec: 'desc' },
        include: {
            tai_xe: {
                include: { nguoi_dung: { select: { ho_ten: true, so_dien_thoai: true } } }
            }
        }
    });
};

export const updateScheduleStatusService = async (id: string, status: string) => {
    return await prisma.lichLamViec.update({
        where: { id },
        data: { trang_thai: status }
    });
};
