export type DriverStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export type LoginRequest = {
    email: string;
    mat_khau: string
}

export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string,
        ho_ten: string,
        so_dien_thoai: string,
        email?: string | null,
        dia_chi?: string | null,
        anh_dai_dien?: string | null,
        vai_tro: string,
        trang_thai_tai_khoan: string;
        so_lan_dang_nhap_sai: number;
        tai_xe_profile?: {
            trang_thai_duyet: DriverStatus,
            ly_do_tu_choi?: string | null,
        }
    };
};

export type RegisterRequest = {
    ho_ten: string;
    so_dien_thoai: string;
    email: string;
    dia_chi: string | null;
    mat_khau: string;
    xac_nhan_mat_khau: string;
}

export type RegisterResponse = {
    accessToken: string;
    refreshToken: string;
    newUser: {
        id: string;
        ho_ten: string;
        so_dien_thoai?: string | null;
        email?: string | null;
        dia_chi?: string | null;
        thoi_gian_tao: string;
    }
}