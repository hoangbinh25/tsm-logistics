import prisma from '../config/prisma';

export const getDashboardStats = async () => {
    // 1. Lọc đơn hàng theo trạng thái
    const orderStats = await prisma.donHang.groupBy({
        by: ['trang_thai_don_hang'],
        _count: { id: true }
    });

    const orderStatsMap = orderStats.reduce((acc, curr) => {
        acc[curr.trang_thai_don_hang] = curr._count.id;
        return acc;
    }, {} as Record<string, number>);

    // 2. Lọc phương tiện theo trạng thái
    const fleetStats = await prisma.phuongTien.groupBy({
        by: ['trang_thai'],
        _count: { id: true }
    });

    const fleetStatsMap = fleetStats.reduce((acc, curr) => {
        acc[curr.trang_thai] = curr._count.id;
        return acc;
    }, {} as Record<string, number>);

    // 3. Danh sách đơn hàng đang vận hành (Active Deliveries)
    const activeShipments = await prisma.donHang.findMany({
        where: {
            trang_thai_don_hang: {
                in: ['DA_PHAN_CONG', 'DANG_LAY_HANG', 'DANG_VAN_CHUYEN']
            }
        },
        take: 10,
        orderBy: { thoi_gian_cap_nhat: 'desc' },
        include: {
            tai_xe: {
                include: { nguoi_dung: { select: { ho_ten: true } } }
            },
            kho_gui: { select: { ten_kho: true, tinh_thanh: true } }
        }
    });

    // 4. Thống kê theo ngày (Biểu đồ lưu lượng 7 ngày gần nhất)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.donHang.findMany({
        where: { thoi_gian_tao: { gte: sevenDaysAgo } },
        select: { thoi_gian_tao: true }
    });

    const chartData: any = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        chartData[key] = 0;
    }

    recentOrders.forEach(o => {
        const key = new Date(o.thoi_gian_tao).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        if (chartData[key] !== undefined) chartData[key]++;
    });

    const chartArray = Object.keys(chartData).reverse().map(key => ({
        time: key,
        orders: chartData[key]
    }));

    // 5. Tổng số liệu kho bãi, nhân sự
    const totalWarehouses = await prisma.khoHang.count();
    const totalDrivers = await prisma.taiXeProfile.count({ where: { trang_thai_duyet: 'APPROVED' } });

    return {
        orders: {
            total: await prisma.donHang.count(),
            active: (orderStatsMap['DA_PHAN_CONG'] || 0) + (orderStatsMap['DANG_LAY_HANG'] || 0) + (orderStatsMap['DANG_VAN_CHUYEN'] || 0),
            completed: orderStatsMap['DA_GIAO'] || 0,
            cancelled: orderStatsMap['DA_HUY'] || 0,
            new: orderStatsMap['TAO_MOI'] || 0
        },
        fleet: {
            total: await prisma.phuongTien.count(),
            moving: fleetStatsMap['DANG_VAN_CHUYEN'] || 0,
            available: fleetStatsMap['SAN_SANG'] || 0,
            maintenance: fleetStatsMap['BAO_TRI'] || 0,
            broken: fleetStatsMap['HU_HONG'] || 0
        },
        activeShipments: activeShipments.map(s => ({
            id: s.ma_don_hang,
            status: s.trang_thai_don_hang,
            origin: s.kho_gui?.tinh_thanh || "Kho",
            dest: s.dia_chi_nhan.split(',').pop()?.trim() || "Điểm đến",
            driver: s.tai_xe?.nguoi_dung?.ho_ten || "Chưa rõ",
            updatedAt: s.thoi_gian_cap_nhat
        })),
        chart: chartArray,
        totalWarehouses,
        totalDrivers
    };
};
