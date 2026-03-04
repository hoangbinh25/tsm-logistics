import cron from 'node-cron';
import prisma from '../config/prisma';

export const startOrderCleanupJob = () => {
    cron.schedule('* * * * *', async () => {
        console.log('Đang quét đơn hàng quá hạn thanh toán...');

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // 10 phút trước

        try {
            // Tìm đơn Online (MOMO/VNPAY) đang ở trạng thái 'TAO_MOI' (chưa thanh toán) và quá 10p
            const expiredOrders = await prisma.donHang.updateMany({
                where: {
                    trang_thai_don_hang: 'TAO_MOI',
                    hinh_thuc_thanh_toan: 'ONLINE', // Chỉ áp dụng cho đơn Online
                    thoi_gian_tao: { lt: tenMinutesAgo }
                },
                data: {
                    trang_thai_don_hang: 'DA_HUY',
                    ghi_chu: 'Hủy tự động do quá hạn thanh toán (10 phút)'
                }
            });

            if (expiredOrders.count > 0) {
                console.log(`Đã hủy tự động ${expiredOrders.count} đơn hàng quá hạn.`);
            }
        } catch (error) {
            console.error('Lỗi Cron Job:', error);
        }
    });
};