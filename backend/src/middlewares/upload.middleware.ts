import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';

// Cấu hình kho lưu trữ trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vietlogistics/drivers', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Định dạng cho phép
    public_id: (req: Request, file: any) => {
        const name = file.originalname.split('.')[0];
        return `${Date.now()}-${name}`;
    }
  } as any 
});

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ được upload file ảnh!'), false);
    }
};

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});