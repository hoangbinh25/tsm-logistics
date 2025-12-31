export type DriverStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export type LoginRequest = {
    email: string;
    password: string
}

export type LoginResponse = {
    accessToken: string;
    user: {
        id: string,
        ho_ten: string,
        so_dien_thoai: string,
        email?: string | null,
        dia_chi?: string | null,
        anh_dai_dien?: string | null,
        ten_dang_nhap: string,
        vai_tro: string,
        trang_thai_tai_khoan: string;

        driver_status: DriverStatus;
        driver_reason_rejected?: string | null;
    };
};