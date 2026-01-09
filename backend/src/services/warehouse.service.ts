import prisma from '../config/prisma';
import { genId26 } from '../types/genId';

export const getAllWarehouses = async () => {
    // Sắp xếp theo ngày tạo mới nhất
    return await prisma.khoHang.findMany({
        orderBy: { thoi_gian_tao: 'desc' },
        include: {
             _count: { select: { don_gui: true, don_nhan: true } } // Đếm số đơn hàng liên quan (để hiển thị thống kê)
        }
    });
};

export const createWarehouse = async (data: any) => {
    return await prisma.khoHang.create({
        data: {
            id: genId26(),
            ma_kho: data.ma_kho,
            ten_kho: data.ten_kho,
            dia_chi: data.dia_chi,
            tinh_thanh: data.tinh_thanh,
            quan_huyen: data.quan_huyen,
            phuong_xa: data.phuong_xa,
            loai_kho: data.loai_kho, // Enum: KHO_CHINH, KHO_TRUNG_CHUYEN...
            suc_chua_toi_da: parseFloat(data.suc_chua_toi_da || 0),
            trang_thai: data.trang_thai || 'HOAT_DONG',
            ghi_chu: data.ghi_chu
        }
    });
};

export const updateWarehouse = async (id: string, data: any) => {
    return await prisma.khoHang.update({
        where: { id },
        data: {
            ma_kho: data.ma_kho,
            ten_kho: data.ten_kho,
            dia_chi: data.dia_chi,
            tinh_thanh: data.tinh_thanh,
            quan_huyen: data.quan_huyen,
            phuong_xa: data.phuong_xa,
            loai_kho: data.loai_kho,
            suc_chua_toi_da: parseFloat(data.suc_chua_toi_da || 0),
            trang_thai: data.trang_thai,
            ghi_chu: data.ghi_chu
        }
    });
};

export const deleteWarehouse = async (id: string) => {
    // Kiểm tra xem kho có đang chứa đơn hàng không trước khi xóa
    const count = await prisma.donHang.count({
        where: { OR: [{ kho_gui_id: id }, { kho_nhan_id: id }] }
    });
    
    if (count > 0) {
        throw new Error("Không thể xóa kho đang có đơn hàng hoạt động!");
    }

    return await prisma.khoHang.delete({
        where: { id }
    });
};