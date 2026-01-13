import prisma from '../config/prisma';
import { genId26 } from '../types/genID'; 

export const getAllServices = async () => {
    return await prisma.dichVuVanChuyen.findMany({
        orderBy: { thoi_gian_tao: 'desc' }
    });
};

export const createService = async (data: any) => {
    return await prisma.dichVuVanChuyen.create({
        data: {
            id: genId26(),
            ma_dich_vu: data.ma_dich_vu,
            ten_dich_vu: data.ten_dich_vu,
            mo_ta: data.mo_ta || "",
            loai_dich_vu: data.loai_dich_vu, // Enum: NOI_TINH, LIEN_TINH
            don_vi_tinh: data.don_vi_tinh,
            gia_co_ban: parseFloat(data.gia_co_ban),
            chinh_sach_gia: data.chinh_sach_gia || "",
            trang_thai: data.trang_thai || 'HOAT_DONG' // Enum: HOAT_DONG, TAM_DUNG...
        }
    });
};

export const updateService = async (id: string, data: any) => {
    return await prisma.dichVuVanChuyen.update({
        where: { id },
        data: {
            ma_dich_vu: data.ma_dich_vu,
            ten_dich_vu: data.ten_dich_vu,
            mo_ta: data.mo_ta,
            loai_dich_vu: data.loai_dich_vu,
            don_vi_tinh: data.don_vi_tinh,
            gia_co_ban: parseFloat(data.gia_co_ban),
            chinh_sach_gia: data.chinh_sach_gia,
            trang_thai: data.trang_thai
        }
    });
};

export const deleteService = async (id: string) => {
    // Nên check xem dịch vụ đã có đơn hàng sử dụng chưa trước khi xóa
    return await prisma.dichVuVanChuyen.delete({
        where: { id }
    });
};