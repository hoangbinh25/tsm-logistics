"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Package, Clock, MapPin } from "lucide-react"

// Định nghĩa kiểu dữ liệu đơn hàng
interface Order {
    id: string;
    ma_don_hang: string;
    trang_thai_don_hang: string;
    tong_tien_hang: number;
    dia_chi_nhan: string;
    dia_chi_giao: string; // Hoặc lấy từ kho_gui
    thoi_gian_tao: string;
}

export default function OrderListPage() {
    const { http } = useAuth();
    const router = useRouter();
    
    // 1. STATE QUẢN LÝ TAB (Mặc định là xem đơn đang chạy)
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    // 2. HÀM GỌI API (Thay đổi theo Tab)
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/orders?type=${activeTab}`);
            
            if (res.ok) {
                const payload = await res.json(); // Phải giải nén JSON
                setOrders(payload.data || []); 
            } else {
                setOrders([]);
            }

        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [http, activeTab]);

    // 3. useEffect: Gọi hàm fetch mỗi khi activeTab thay đổi
    useEffect(() => {
        fetchOrders();
    }, [activeTab, fetchOrders]);

    // Hàm tô màu trạng thái cho đẹp
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'TAO_MOI': return 'bg-blue-100 text-blue-700';
            case 'DA_PHAN_CONG': return 'bg-purple-100 text-purple-700';
            case 'DANG_VAN_CHUYEN': return 'bg-yellow-100 text-yellow-800';
            case 'DA_GIAO': return 'bg-green-100 text-green-700';
            case 'DA_HUY': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <h1 className="text-xl font-bold text-gray-800">Quản lý đơn hàng</h1>
                
                {/* 4. THANH TABS CHUYỂN ĐỔI */}
                <div className="flex mt-4 bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                            activeTab === 'active' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Đang thực hiện
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                            activeTab === 'history' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Lịch sử / Đã xong
                    </button>
                </div>
            </div>

            {/* Danh sách đơn hàng */}
            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-10 flex flex-col items-center text-gray-400">
                        <Package className="w-12 h-12 mb-2 opacity-20" />
                        <p>Không có đơn hàng nào ở mục này</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div 
                            key={order.id} 
                            onClick={() => router.push(`/driver/orders/${order.id}`)} // Bấm vào xem chi tiết
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="font-bold text-gray-800">#{order.ma_don_hang}</span>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(order.thoi_gian_tao), "dd/MM/yyyy HH:mm")}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.trang_thai_don_hang)}`}>
                                    {order.trang_thai_don_hang}
                                </span>
                            </div>

                            <div className="space-y-2 border-t pt-3">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm text-gray-600 line-clamp-2">{order.dia_chi_nhan}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}