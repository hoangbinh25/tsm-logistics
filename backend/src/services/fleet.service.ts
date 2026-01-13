import prisma from '../config/prisma';
import { genId26 } from '../types/genID';

export const getAllVehicles = async () => {
    return await prisma.phuongTien.findMany({
        orderBy: { thoi_gian_tao: 'desc' }
    });
};

export const createVehicle = async (data: any) => {
    // data bao gồm: bien_kiem_soat, hang_xe, model...
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
            ghi_chu: data.ghi_chu
        }
    });
};

export const deleteVehicle = async (id: string) => {
    return await prisma.phuongTien.delete({
        where: { id }
    });
};