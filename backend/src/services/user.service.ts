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

export const updateProfileService = async (userId: string, data: any, file?: Express.Multer.File) => {
    let avatarUrl = undefined;

    // 1. Nếu có file ảnh gửi lên -> Upload lấy link
    if (file) {
        avatarUrl = await uploadToCloudinary(file.buffer);
    }

    // 2. Update vào Database
    const updatedUser = await prisma.nguoiDung.update({
        where: { id: userId },
        data: {
            ho_ten: data.ho_ten,
            so_dien_thoai: data.so_dien_thoai || null, // Xử lý empty string
            dia_chi: data.dia_chi,
            // Nếu có ảnh mới thì update, không thì giữ nguyên
            ...(avatarUrl && { anh_dai_dien: avatarUrl }),
        },
    });

    return updatedUser;
};

