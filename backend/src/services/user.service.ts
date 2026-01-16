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
        select: {
            id: true,
            ho_ten: true,
            email: true,
            so_dien_thoai: true,
            vai_tro: true,
            anh_dai_dien: true
        },
        orderBy: { thoi_gian_tao: 'desc' }
    });

    return users;
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
