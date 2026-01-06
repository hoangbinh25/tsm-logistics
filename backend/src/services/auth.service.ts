import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { customAlphabet } from "nanoid";
import { OAuth2Client } from "google-auth-library";
import { DriverStatus, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/auth";
import { formatVNTime } from "../utils/date.util";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
const MAX_LOGIN_ATTEMPTS = 5;

const genId26 = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 26);

export async function loginService(payload: LoginRequest): Promise<LoginResponse> {
    const email = payload.email.trim().toLowerCase();
    const password = payload.mat_khau;

    const user = await prisma.nguoiDung.findFirst({
        where: {
            email,
        },
        select: {
            id: true,
            ho_ten: true,
            so_dien_thoai: true,
            email: true,
            dia_chi: true,
            anh_dai_dien: true,
            vai_tro: true,
            trang_thai_tai_khoan: true,
            so_lan_dang_nhap_sai: true,
            mat_khau_ma_hoa: true,
            tai_xe_profile: {
                select: {
                    trang_thai_duyet: true,
                    ly_do_tu_choi: true,
                },
            },
        },
    });
    if (!user || !user.mat_khau_ma_hoa) {
        throw new Error("Email hoặc mật khẩu không chính xác");
    }

    if (user.trang_thai_tai_khoan === "LOCKED" || user.so_lan_dang_nhap_sai >= MAX_LOGIN_ATTEMPTS) {
        throw new Error("Tài khoản đã bị khóa do đăng nhập sai nhiều lần. Vui lòng liên hệ Admin");
    }

    // verify password
    if (!user.mat_khau_ma_hoa) {
        throw new Error("Invalid password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.mat_khau_ma_hoa);
    if (!isPasswordValid) {
        await prisma.nguoiDung.update({
            where: { id: user.id },
            data: {
                so_lan_dang_nhap_sai: user.so_lan_dang_nhap_sai + 1,
            },
        });
        throw new Error("Invalid password");
    }
    // reset so lan dang nhap sai
    if (user.so_lan_dang_nhap_sai > 0) {
        await prisma.nguoiDung.update({
            where: { id: user.id },
            data: {
                so_lan_dang_nhap_sai: 0,
            },
        });
    }

    // driver status 
    let driver_status: DriverStatus = "NONE";
    let driver_reason_rejected: string | null = null;
    if (user.tai_xe_profile) {
        driver_status = user.tai_xe_profile.trang_thai_duyet as DriverStatus;
        driver_reason_rejected = user.tai_xe_profile.ly_do_tu_choi ?? null;
    }

    // create JWT 
    const accessToken = jwt.sign(
        { sub: user.id, role: user.vai_tro },
        process.env.JWT_ACCESS_SECRET as string,
        {
            expiresIn: "3d",
        });

    const refreshToken = jwt.sign(
        { sub: user.id, role: user.vai_tro },
        process.env.JWT_REFRESH_SECRET as string,
        {
            expiresIn: "7d",
        });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            ho_ten: user.ho_ten,
            so_dien_thoai: user.so_dien_thoai || "",
            email: user.email,
            dia_chi: user.dia_chi,
            anh_dai_dien: user.anh_dai_dien,
            vai_tro: user.vai_tro,
            trang_thai_tai_khoan: user.trang_thai_tai_khoan,
            so_lan_dang_nhap_sai: user.so_lan_dang_nhap_sai,
            tai_xe_profile: {
                trang_thai_duyet: driver_status,
                ly_do_tu_choi: driver_reason_rejected,
            },
        },
    };
}

export async function registerService(payload: RegisterRequest): Promise<RegisterResponse> {
    const { ho_ten, so_dien_thoai, email, mat_khau, xac_nhan_mat_khau } = payload;
    if (mat_khau !== xac_nhan_mat_khau) {
        throw new Error("Password not match");
    }

    const mat_khau_ma_hoa = await bcrypt.hash(mat_khau, 10);
    const id = genId26();

    // Check phone number
    const existingUser = await prisma.nguoiDung.findUnique({
        where: {so_dien_thoai: so_dien_thoai}
    });
    
    if(existingUser) {
        throw new Error("Số điện thoại đã được đăng ký!");
    }

    // Check email
    const existingEmail = await prisma.nguoiDung.findUnique({
        where: {email: email}
    });

    if(existingEmail) {
        throw new Error("Email đã được đăng ký!");
    }

    const newUser = await prisma.nguoiDung.create({
        data: {
            id,
            ho_ten,
            so_dien_thoai,
            email,
            mat_khau_ma_hoa,
        },
        select: {
            id: true,
            ho_ten: true,
            so_dien_thoai: true,
            email: true,
            thoi_gian_tao: true
        }
    });

    const accessToken = jwt.sign(
        { sub: newUser.id, role: "KHACH_HANG" },
        process.env.JWT_ACCESS_SECRET as string,
        {
            expiresIn: "3d",
        }
    )

    const refreshToken = jwt.sign(
        { sub: newUser.id, role: "KHACH_HANG" },
        process.env.JWT_REFRESH_SECRET as string,
        {
            expiresIn: "7d",
        });

    return {
        accessToken,
        refreshToken,
        newUser: {
            id: newUser.id,
            ho_ten: newUser.ho_ten,
            so_dien_thoai: newUser.so_dien_thoai,
            email: newUser.email,
            thoi_gian_tao: formatVNTime(newUser.thoi_gian_tao),
        }
    };
}

export async function loginGoogleService(token: string): Promise<LoginResponse> {
    const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    if (!googleResponse.ok) {
        throw new Error("Invalid Google Access Token");
    }
        
    const payload = await googleResponse.json();

    const email = payload.email.toLowerCase();

    // Tìm user
    let user = await prisma.nguoiDung.findFirst({
        where: { email },
        include: {
            tai_xe_profile: true
        }
    });

    // Nếu chưa có -> tạo mới
    if (!user) {
        const id = genId26();
        user = await prisma.nguoiDung.create({
            data: {
                id,
                email,
                ho_ten: payload.name || "Nguoi dung Google",
                anh_dai_dien: payload.picture,
                so_dien_thoai: "",
                trang_thai_tai_khoan: "ACTIVE",
            },
            include: {
                tai_xe_profile: true
            }
        });
    }

    if (user.trang_thai_tai_khoan !== "ACTIVE") {
        throw new Error("Tài khoản của bạn đã bị khóa");
    }

    // Driver status logic
    let driver_status: DriverStatus = "NONE";
    let driver_reason_rejected: string | null = null;
    if (user.tai_xe_profile) {
        driver_status = user.tai_xe_profile.trang_thai_duyet as DriverStatus;
        driver_reason_rejected = user.tai_xe_profile.ly_do_tu_choi ?? null;
    }

    const accessToken = jwt.sign(
        { sub: user.id, role: user.vai_tro },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: "3d" }
    );

    const refreshToken = jwt.sign(
        { sub: user.id, role: user.vai_tro },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: "7d" }
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            ho_ten: user.ho_ten,
            so_dien_thoai: user.so_dien_thoai || "",
            email: user.email as string,
            dia_chi: user.dia_chi,
            anh_dai_dien: user.anh_dai_dien,
            vai_tro: user.vai_tro,
            trang_thai_tai_khoan: user.trang_thai_tai_khoan,
            so_lan_dang_nhap_sai: user.so_lan_dang_nhap_sai,
            tai_xe_profile: {
                trang_thai_duyet: driver_status,
                ly_do_tu_choi: driver_reason_rejected,
            },
        },
    };
}
