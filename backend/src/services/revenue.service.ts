import prisma from '../config/prisma';

export const getRevenueStats = async () => {
    // 1. Tính tổng doanh thu toàn hệ thống (Chỉ tính đơn ĐÃ GIAO)
    const totalRevenue = await prisma.donHang.aggregate({
        _sum: { tong_thanh_toan: true },
        where: { trang_thai_don_hang: 'DA_GIAO' }
    });

    // 2. Đếm số lượng đơn hàng
    const totalOrders = await prisma.donHang.count();
    const completedOrders = await prisma.donHang.count({
        where: { trang_thai_don_hang: 'DA_GIAO' }
    });
    const cancelledOrders = await prisma.donHang.count({
        where: { trang_thai_don_hang: 'DA_HUY' }
    });

    // 3. Lấy dữ liệu biểu đồ 6 tháng gần nhất
    // (Vì Prisma group by date hơi phức tạp, ta lấy raw data rồi xử lý JS cho đơn giản)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await prisma.donHang.findMany({
        where: {
            trang_thai_don_hang: 'DA_GIAO',
            thoi_gian_hoan_thanh: { gte: sixMonthsAgo }
        },
        select: {
            thoi_gian_hoan_thanh: true,
            tong_thanh_toan: true
        }
    });

    // Gom nhóm theo tháng (Format: "Tháng 1", "Tháng 2"...)
    const chartData: any = {};
    orders.forEach(order => {
        const date = new Date(order.thoi_gian_hoan_thanh!);
        const key = `T${date.getMonth() + 1}`; // T1, T2...
        
        if (!chartData[key]) chartData[key] = 0;
        chartData[key] += Number(order.tong_thanh_toan);
    });

    // Chuyển object thành array cho Recharts
    const chartArray = Object.keys(chartData).map(key => ({
        name: key,
        total: chartData[key]
    }));

    return {
        revenue: Number(totalRevenue._sum.tong_thanh_toan || 0),
        orders: {
            total: totalOrders,
            completed: completedOrders,
            cancelled: cancelledOrders
        },
        chart: chartArray
    };
};