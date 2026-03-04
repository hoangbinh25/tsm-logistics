import axios from 'axios';

const GHTK_API_TOKEN = process.env.GHTK_API_TOKEN || '';
const GHTK_BASE_URL = process.env.GHTK_BASE_URL || 'https://services.giaohangtietkiem.vn';

const ghtkClient = axios.create({
    baseURL: GHTK_BASE_URL,
    headers: {
        'Token': GHTK_API_TOKEN,
        'Content-Type': 'application/json',
    },
});

export interface GHTKFeeParams {
    pick_province: string;
    pick_district: string;
    province: string;
    district: string;
    address: string;
    weight: number; // grams
    value?: number; // VND
    transport?: 'road' | 'fly';
}

export interface GHTKOrderParams {
    id: string;
    pick_name: string;
    pick_money: number;
    pick_address: string;
    pick_province: string;
    pick_district: string;
    pick_tel: string;
    tel: string;
    name: string;
    address: string;
    province: string;
    district: string;
    is_freeship: "0" | "1";
    weight: number;
    value?: number;
    note?: string;
    transport?: 'road' | 'fly';
}

/**
 * Tính phí vận hành qua GHTK
 */
export const calculateGHTKFee = async (params: GHTKFeeParams) => {
    try {
        const response = await ghtkClient.get('/services/shipment/fee', { params });
        if (response.data.success) {
            return response.data.fee;
        }
        throw new Error(response.data.message || 'Lỗi tính phí GHTK');
    } catch (error: any) {
        console.error('GHTK Fee Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Đăng đơn hàng lên GHTK
 */
export const createGHTKOrder = async (orderData: GHTKOrderParams, items: any[]) => {
    try {
        const payload = {
            products: items.map(item => ({
                name: item.ten_hang_hoa || item.name,
                weight: (item.khoi_luong || item.weight) / 1000, // GHTK dùng kg trong products? Không, docs bảo weight là kg. 
                // Lưu ý: Trong fee param weight là grams, nhưng trong order payload thường là kg hoặc grams tùy version.
                // Theo docs v2, weight trong products là kg, weight trong order là kg.
                quantity: item.so_luong || 1,
                product_code: item.id
            })),
            order: {
                ...orderData,
                weight: orderData.weight / 1000, // Chuyển grams sang kg nếu hệ thống đang dùng grams
            }
        };

        const response = await ghtkClient.post('/services/shipment/order', payload);
        return response.data;
    } catch (error: any) {
        console.error('GHTK Create Order Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Lấy trạng thái đơn hàng từ GHTK
 */
export const getGHTKOrderStatus = async (label: string) => {
    try {
        const response = await ghtkClient.get(`/services/shipment/v2/${label}`);
        return response.data;
    } catch (error: any) {
        console.error('GHTK Status Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Hủy đơn hàng GHTK
 */
export const cancelGHTKOrder = async (label: string) => {
    try {
        const response = await ghtkClient.post(`/services/shipment/v2/cancel/${label}`);
        return response.data;
    } catch (error: any) {
        console.error('GHTK Cancel Error:', error.response?.data || error.message);
        throw error;
    }
};
