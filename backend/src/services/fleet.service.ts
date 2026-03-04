import prisma from '../config/prisma';
import { genId26 } from '../types/genID';

export const getAllVehicles = async () => {
    return await prisma.phuongTien.findMany({
        orderBy: { thoi_gian_tao: 'desc' }
    });
};

export const createVehicle = async (data: any) => {
    return await prisma.phuongTien.create({
        data: {
            id: genId26(),
            bien_kiem_soat: data.bien_kiem_soat,
            loai_phuong_tien: data.loai_phuong_tien,
            hang_xe: data.hang_xe,
            model: data.model,
            nam_san_xuat: parseInt(data.nam_san_xuat),
            tai_trong_toi_da: parseFloat(data.tai_trong_toi_da),
            the_tich_thung: parseFloat(data.the_tich_thung),
            trang_thai: data.trang_thai || 'SAN_SANG',
            ngay_dang_kiem: new Date(data.ngay_dang_kiem),
            ngay_het_han_dang_kiem: new Date(data.ngay_het_han_dang_kiem),
            so_km_da_di: data.so_km_da_di ? parseInt(data.so_km_da_di) : 0,
            ngay_bao_duong_cuoi: data.ngay_bao_duong_cuoi ? new Date(data.ngay_bao_duong_cuoi) : null,
            dinh_ky_bao_duong_km: data.dinh_ky_bao_duong_km ? parseInt(data.dinh_ky_bao_duong_km) : 5000,
            ghi_chu: data.ghi_chu
        }
    });
};

export const updateVehicle = async (id: string, data: any) => {
    return await prisma.phuongTien.update({
        where: { id },
        data: {
            bien_kiem_soat: data.bien_kiem_soat,
            loai_phuong_tien: data.loai_phuong_tien,
            hang_xe: data.hang_xe,
            model: data.model,
            nam_san_xuat: parseInt(data.nam_san_xuat),
            tai_trong_toi_da: parseFloat(data.tai_trong_toi_da),
            the_tich_thung: parseFloat(data.the_tich_thung),
            trang_thai: data.trang_thai,
            ngay_dang_kiem: new Date(data.ngay_dang_kiem),
            ngay_het_han_dang_kiem: new Date(data.ngay_het_han_dang_kiem),
            so_km_da_di: data.so_km_da_di ? parseInt(data.so_km_da_di) : undefined,
            ngay_bao_duong_cuoi: data.ngay_bao_duong_cuoi ? new Date(data.ngay_bao_duong_cuoi) : undefined,
            dinh_ky_bao_duong_km: data.dinh_ky_bao_duong_km ? parseInt(data.dinh_ky_bao_duong_km) : undefined,
            ghi_chu: data.ghi_chu
        }
    });
};

export const checkMaintenanceAndNotify = async () => {
    // Lấy danh sách xe cần bảo dưỡng (km hiện tại >= định kỳ)
    const vehiclesNeedMaintenance = await prisma.phuongTien.findMany({
        where: {
            trang_thai: { not: 'HU_HONG' },
            so_km_da_di: {
                gt: 0
            }
        }
    });

    const needNotify = vehiclesNeedMaintenance.filter(v => v.so_km_da_di >= v.dinh_ky_bao_duong_km);

    if (needNotify.length > 0) {
        // Lấy danh sách quản lý
        const admins = await prisma.nguoiDung.findMany({
            where: { vai_tro: 'QUAN_LY' }
        });

        for (const vehicle of needNotify) {
            for (const admin of admins) {
                // Kiểm tra xem đã thông báo chưa (tránh spam, ví dụ trong vòng 7 ngày)
                const existingNotif = await prisma.thongBao.findFirst({
                    where: {
                        nguoi_nhan_id: admin.id,
                        tieu_de: { contains: vehicle.bien_kiem_soat },
                        thoi_gian_tao: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                });

                if (!existingNotif) {
                    await prisma.thongBao.create({
                        data: {
                            nguoi_nhan_id: admin.id,
                            tieu_de: `Cảnh báo bảo dưỡng: ${vehicle.bien_kiem_soat}`,
                            noi_dung: `Xe ${vehicle.bien_kiem_soat} (${vehicle.hang_xe} ${vehicle.model}) đã đi được ${vehicle.so_km_da_di}km, vượt quá định kỳ bảo dưỡng ${vehicle.dinh_ky_bao_duong_km}km. Vui lòng kiểm tra.`,
                            loai_thong_bao: 'MAINTENANCE'
                        }
                    });
                }
            }
        }
    }
    return needNotify;
};

export const maintainVehicle = async (id: string) => {
    const vehicle = await prisma.phuongTien.findUnique({ where: { id } });
    if (!vehicle) throw new Error("Không tìm thấy xe");

    return await prisma.phuongTien.update({
        where: { id },
        data: {
            ngay_bao_duong_cuoi: new Date(),
            // Cập nhật định kỳ tiếp theo = số KM hiện tại + 5000 (hoặc tùy cấu hình)
            dinh_ky_bao_duong_km: vehicle.so_km_da_di + 5000,
            trang_thai: 'SAN_SANG' // Đưa về trạng thái sẵn sàng sau khi bảo dưỡng xong
        }
    });
};

export const updateVehicleLocation = async (id: string, location: string) => {
    return await prisma.phuongTien.update({
        where: { id },
        data: {
            vi_tri_hien_tai: location
        }
    });
};

export const deleteVehicle = async (id: string) => {
    return await prisma.phuongTien.delete({
        where: { id }
    });
};