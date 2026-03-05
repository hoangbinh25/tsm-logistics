import prisma from '../config/prisma';
import cloudinary from "../config/cloudinary"
import { Readable } from 'stream';

// Hàm helper để upload buffer lên Cloudinary
const uploadToCloudinary = (buffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "tsm-logistics/avatars" }, // Tên folder trên Cloudinary
            (error, result) => {
                if (error) return reject(error);
                if (result) return resolve(result.secure_url);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};

export const getUsersService = async (role?: string) => {
    const whereCondition = role ? { vai_tro: role as any } : {};

    const users = await prisma.nguoiDung.findMany({
        where: whereCondition,
        include: {
            khach_hang_profile: true
        },
        orderBy: { thoi_gian_tao: 'desc' }
    });

    return users;
};

export const getCustomerDetailService = async (id: string) => {
    return await prisma.nguoiDung.findUnique({
        where: { id },
        include: {
            khach_hang_profile: true,
            so_dia_chi: {
                orderBy: { is_default: 'desc' }
            },
            don_hang_khach: {
                orderBy: { thoi_gian_tao: 'desc' },
                include: {
                    thanh_toan: true
                }
            }
        }
    });
};

export const updateProfileService = async (userId: string, data: any, avatarUrl?: string) => {
    const phoneToSave = (data.so_dien_thoai && data.so_dien_thoai.trim() !== "")
        ? data.so_dien_thoai
        : null;

    return await prisma.nguoiDung.update({
        where: { id: userId },
        data: {
            ho_ten: data.ho_ten,
            so_dien_thoai: phoneToSave,
            dia_chi: data.dia_chi,
            // Chỉ update nếu có link ảnh mới
            ...(avatarUrl && { anh_dai_dien: avatarUrl })
        }
    });
};
