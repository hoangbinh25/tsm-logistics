import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { LoginRequest, LoginResponse } from "../types/auth";

export async function loginService(payload: LoginRequest): Promise<LoginResponse> {
    const email = payload.email.trim().toLowerCase();
    const password = payload.password;

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
            ten_dang_nhap: true,
            vai_tro: true,
            trang_thai_tai_khoan: true,
            so_lan_dang_nhap_sai: true,
            mat_khau_ma_hoa: true,
            tai_xe_profile: {
                select: {
                    trang_thai_duyet: true,
                    ly_do_tu_choi: true,
                }
            }
        }
    })
}