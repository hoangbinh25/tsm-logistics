import prisma from "../config/prisma";

export const createNotificationService = async (userId: string, title: string, content: string, type: string = "SYSTEM") => {
    return await prisma.thongBao.create({
        data: {
            nguoi_nhan_id: userId,
            tieu_de: title,
            noi_dung: content,
            loai_thong_bao: type
        }
    });
};

export const getUserNotificationsService = async (userId: string) => {
    return await prisma.thongBao.findMany({
        where: { nguoi_nhan_id: userId },
        orderBy: { thoi_gian_tao: 'desc' }
    });
};