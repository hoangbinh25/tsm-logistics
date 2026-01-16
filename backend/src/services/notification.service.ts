import prisma from "../config/prisma";

export const getUserNotificationsService = async (userId: string) => {
    
    return await prisma.thongBao.findMany({
        where: { nguoi_nhan_id: userId },
        orderBy: { thoi_gian_tao: 'desc' }
    });
};