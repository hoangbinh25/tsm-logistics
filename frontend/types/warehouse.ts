export interface Warehouse {
    id: string;
    ma_kho: string;
    ten_kho: string;
    dia_chi: string;
    tinh_thanh: string;
    quan_huyen: string;
    phuong_xa: string;
    loai_kho: string;
    suc_chua_toi_da: string | number;
    trang_thai: string;
    ghi_chu?: string;
}
