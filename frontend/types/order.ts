export interface OrderItem {
    ten_hang_hoa: string;
    mo_ta?: string;
    so_luong: number;
    don_vi: string;
    khoi_luong: number;
    kich_thuoc: string;
    gia_tri: number;
    thanh_tien: number;
    tien_cod: number;
}

export interface OrderPayment {
    id: string;
    ma_giao_dich: string;
    trang_thai: 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'CANCELLED';
    thoi_gian_tao: string;
}

export interface WarehouseInfo {
    id: string;
    ten_kho: string;
    dia_chi: string;
}

export interface DriverInfo {
    id: string;
    nguoi_dung: {
        ho_ten: string;
        so_dien_thoai: string;
    };
}

export interface VehicleInfo {
    id: string;
    bien_kiem_soat: string;
}

export interface OrderDetail {
    id: string;
    ma_don_hang: string;
    trang_thai_don_hang: string;
    thoi_gian_tao: string;
    dia_chi_giao: string;
    dia_chi_nhan: string;
    hinh_thuc_thanh_toan: string;
    payer: string;
    phi_van_chuyen: number;
    tong_tien_hang: number;
    tong_thanh_toan: number;
    thoi_gian_du_kien?: string;
    thoi_gian_hoan_thanh?: string;
    kho_gui?: WarehouseInfo;
    chi_tiet: OrderItem[];
    thanh_toan: OrderPayment[];
    tai_xe?: DriverInfo;
    phuong_tien?: VehicleInfo;
}

export interface OrderListResponse {
    data: OrderDetail[];
}

export interface OrderDetailResponse {
    data: OrderDetail;
}

export interface PaymentStatusResponse {
    status: 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'CANCELLED';
}
