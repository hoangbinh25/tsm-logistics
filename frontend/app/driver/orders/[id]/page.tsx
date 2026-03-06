// app/driver/orders/[id]/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, ArrowLeft, Box, AlertTriangle } from "lucide-react"
import toast from 'react-hot-toast'
import { fetchWithAuth } from "@/utils/api"
import { IncidentModal } from "@/components/driver/incident-modal"

interface OrderDetail {
    id: string;
    ma_don_hang: string;
    trang_thai_don_hang: string;
    dia_chi_nhan: string;
    ghi_chu?: string;
    khach_hang: {
        ho_ten: string;
        so_dien_thoai: string;
    };
}

export default function DriverOrderDetail() {
    const { id } = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [isIncidentOpen, setIsIncidentOpen] = useState(false)

    // 1. Hàm lấy chi tiết đơn hàng
    const fetchOrderDetail = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`);

            if (res.ok) {
                const payload = await res.json();
                setOrder(payload.data || payload);
            } else {
                toast.error("Không tìm thấy đơn hàng");
            }
        } catch (error) {
            toast.error("Lỗi tải dữ liệu");
            console.error(error);
        }
    }, [fetchWithAuth, id]);

    useEffect(() => {
        if (id) fetchOrderDetail()
    }, [id, fetchOrderDetail])

    // 2. Logic cập nhật trạng thái
    const handleUpdateStatus = async () => {
        if (!order) return

        let nextStatus = ""
        if (order.trang_thai_don_hang === 'DA_PHAN_CONG') nextStatus = 'DANG_LAY_HANG'
        else if (order.trang_thai_don_hang === 'DANG_LAY_HANG') nextStatus = 'DANG_VAN_CHUYEN'
        else if (order.trang_thai_don_hang === 'DANG_VAN_CHUYEN') nextStatus = 'DA_GIAO'

        if (!nextStatus) return;

        setLoading(true)
        const loadingToast = toast.loading("Đang cập nhật...");

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json' // Bắt buộc phải có
                },
                body: JSON.stringify({ trang_thai: nextStatus })
            })

            if (res.ok) {
                toast.success("Cập nhật thành công!");
                await fetchOrderDetail(); // Tải lại dữ liệu
            } else {
                throw new Error("Lỗi cập nhật");
            }

        } catch (e) {
            toast.error("Lỗi: Không thể cập nhật trạng thái");
            console.error(e)
        } finally {
            toast.dismiss(loadingToast);
            setLoading(false)
        }
    }

    // Render nút bấm (Logic giữ nguyên, chỉ đổi tên biến trạng thái cho khớp DB)
    const renderActionButton = () => {
        const status = order?.trang_thai_don_hang;

        switch (status) {
            case 'DA_PHAN_CONG':
                return <Button disabled={loading} size="lg" className="w-full bg-blue-600 h-14 text-lg" onClick={handleUpdateStatus}>Bắt đầu đi lấy hàng</Button>
            case 'DANG_LAY_HANG':
                return <Button disabled={loading} size="lg" className="w-full bg-orange-600 h-14 text-lg" onClick={handleUpdateStatus}>Đã lấy hàng xong</Button>
            case 'DANG_VAN_CHUYEN':
                return <Button disabled={loading} size="lg" className="w-full bg-green-600 h-14 text-lg" onClick={handleUpdateStatus}>Xác nhận giao thành công</Button>
            case 'DA_GIAO':
                return <Button disabled size="lg" className="w-full bg-gray-400 h-14 text-lg">Đơn hàng đã hoàn tất</Button>
            default:
                return null
        }
    }

    if (!order) return <div className="p-10 text-center">Đang tải dữ liệu...</div>

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft /></Button>
                <h1 className="font-bold text-lg">Đơn {order.ma_don_hang}</h1>
                <div className="ml-auto flex items-center gap-2">
                    {order.trang_thai_don_hang !== 'DA_GIAO' &&
                        order.trang_thai_don_hang !== 'DA_HUY' &&
                        order.trang_thai_don_hang !== 'GIAO_KHONG_THANH_CONG' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:bg-red-50 h-8 w-8"
                                onClick={() => setIsIncidentOpen(true)}
                            >
                                <AlertTriangle className="w-5 h-5" />
                            </Button>
                        )}
                    <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">
                        {order.trang_thai_don_hang}
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                    <h3 className="font-semibold text-gray-500 text-sm uppercase">Thông tin giao hàng</h3>
                    <div className="flex items-start gap-3">
                        <MapPin className="text-red-500 w-5 h-5 mt-1" />
                        <div>
                            <p className="font-bold text-lg">{order.dia_chi_nhan}</p>
                            <p className="text-gray-500 text-sm">
                                Người gửi: {order.khach_hang?.ho_ten || "Khách lẻ"}
                            </p>
                        </div>
                    </div>

                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-gray-500 text-sm uppercase mb-2">Ghi chú vận đơn</h3>
                    <p className="bg-yellow-50 p-3 rounded-md text-sm border border-yellow-100 text-yellow-800">
                        {order.ghi_chu || "Không có ghi chú nào"}
                    </p>
                </div>
            </div>

            <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t md:max-w-md md:mx-auto z-20">
                {renderActionButton()}
            </div>

            <IncidentModal
                isOpen={isIncidentOpen}
                onClose={() => setIsIncidentOpen(false)}
                orderId={order.id}
                orderCode={order.ma_don_hang}
            />
        </div>
    )
}