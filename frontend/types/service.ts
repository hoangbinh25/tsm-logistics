export interface Service {
    id: string;
    ma_dich_vu: string;
    ten_dich_vu: string;
    mo_ta?: string;
    loai_dich_vu: string;
    don_vi_tinh: string;
    gia_co_ban: number | string;
    chinh_sach_gia?: string;
    trang_thai: string;
}
