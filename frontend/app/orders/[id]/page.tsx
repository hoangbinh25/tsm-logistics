"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, Calendar, Clock, MapPin, 
  Truck, CheckCircle, Package, User 
} from "lucide-react"
import { format } from "date-fns"

export default function OrderDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { http } = useAuth()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`)
                if (res.ok) {
                    const payload = await res.json()
                    setOrder(payload.data)
                }
            } catch (error) {
                console.error("Lỗi:", error)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchOrderDetail()
    }, [id, http])

    if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
    if (!order) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy đơn hàng</div>

    const estimatedDate = order.thoi_gian_du_kien 
        ? new Date(order.thoi_gian_du_kien) 
        : new Date(new Date(order.thoi_gian_tao).getTime() + 3 * 24 * 60 * 60 * 1000);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                {/* Nút quay lại */}
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
                </Button>

                {/* Header đơn hàng */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            Đơn hàng #{order.ma_don_hang}
                            <Badge className="text-base px-3 py-1">{order.trang_thai_don_hang}</Badge>
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Ngày đặt: {format(new Date(order.thoi_gian_tao), "dd/MM/yyyy HH:mm")}
                        </p>
                    </div>
                    {/* Nút xem Tracking công khai nếu muốn gửi cho người khác */}
                    <Button variant="outline" onClick={() => router.push(`/tracking/${order.ma_don_hang}`)}>
                        Xem Tracking công khai
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CỘT TRÁI: THÔNG TIN VẬN CHUYỂN & THỜI GIAN (QUAN TRỌNG) */}
                    <div className="md:col-span-2 space-y-6">
                        
                        <Card className="border-blue-100 bg-blue-50/50 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                                    <Clock className="w-5 h-5" /> Tiến độ thời gian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                {/* 1. Thời gian lấy hàng (Dựa vào ngày tạo hoặc ngày shipper nhận) */}
                                <div className="bg-white p-3 rounded-lg border border-blue-100">
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Thời gian lấy hàng</p>
                                    <p className="font-bold text-slate-800">
                                        {format(new Date(order.thoi_gian_tao), "HH:mm dd/MM")}
                                    </p>
                                    <p className="text-xs text-green-600 flex items-center mt-1">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Đã hoàn tất
                                    </p>
                                </div>

                                {/* 2. Thời gian dự kiến giao */}
                                <div className="bg-white p-3 rounded-lg border border-blue-100">
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Dự kiến giao</p>
                                    <p className="font-bold text-blue-600">
                                        {format(estimatedDate, "dd/MM/yyyy")}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">Trước 18:00</p>
                                </div>

                                {/* 3. Thời gian hoàn thành (Nếu có) */}
                                <div className={`p-3 rounded-lg border ${order.thoi_gian_hoan_thanh ? 'bg-green-50 border-green-200' : 'bg-slate-100 border-slate-200 dashed'}`}>
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Thời gian thực tế</p>
                                    {order.thoi_gian_hoan_thanh ? (
                                        <>
                                            <p className="font-bold text-green-700">
                                                {format(new Date(order.thoi_gian_hoan_thanh), "HH:mm dd/MM")}
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">Đúng tiến độ</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic py-1">-- Đang cập nhật --</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin lộ trình (Địa chỉ) */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Lộ trình vận chuyển</CardTitle></CardHeader>
                            <CardContent className="space-y-6 relative">
                                {/* Đường nối */}
                                <div className="absolute left-7.25 top-10 bottom-10 w-0.5 bg-slate-200"></div>

                                {/* Điểm gửi */}
                                <div className="flex gap-4 relative">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 z-10">
                                        <Package className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Kho gửi hàng</p>
                                        <p className="text-slate-600">{order.kho_gui?.ten_kho || "Kho trung tâm"}</p>
                                        <p className="text-sm text-slate-500">{order.kho_gui?.dia_chi || order.dia_chi_giao}</p>
                                    </div>
                                </div>

                                {/* Điểm nhận */}
                                <div className="flex gap-4 relative">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 z-10">
                                        <MapPin className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Địa chỉ nhận hàng</p>
                                        <p className="text-slate-600">{order.dia_chi_nhan.split(' - ')[0]}</p>
                                        <p className="text-sm text-slate-500">{order.dia_chi_nhan}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Chi tiết hàng hóa */}
                        <Card>
                             <CardHeader><CardTitle className="text-base">Sản phẩm / Hàng hóa</CardTitle></CardHeader>
                             <CardContent>
                                <div className="space-y-3">
                                    {order.chi_tiet?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                                            <div>
                                                <p className="font-medium">{item.ten_hang_hoa}</p>
                                                <p className="text-sm text-slate-500">{item.mo_ta}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">x{item.so_luong}</p>
                                                <p className="text-sm text-slate-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.thanh_tien)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </CardContent>
                        </Card>
                    </div>

                    {/* CỘT PHẢI: TÀI XẾ & THANH TOÁN */}
                    <div className="space-y-6">
                        {/* Thông tin tài xế (Chỉ hiện khi đã phân công) */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Thông tin tài xế</CardTitle></CardHeader>
                            <CardContent>
                                {order.tai_xe ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{order.tai_xe.nguoi_dung?.ho_ten}</p>
                                            <p className="text-sm text-slate-500">{order.tai_xe.nguoi_dung?.so_dien_thoai}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Truck className="w-3 h-3 text-slate-400" />
                                                <span className="text-xs text-slate-600">{order.phuong_tien?.bien_kiem_soat}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-slate-500 text-sm">
                                        Đang tìm tài xế phù hợp...
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tổng quan thanh toán */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Thanh toán</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Phí vận chuyển</span>
                                    <span>{new Intl.NumberFormat('vi-VN').format(order.phi_van_chuyen)} đ</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Tiền hàng (COD)</span>
                                    <span>{new Intl.NumberFormat('vi-VN').format(order.tong_tien_hang)} đ</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg text-blue-700">
                                    <span>Tổng cộng</span>
                                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tong_thanh_toan)}</span>
                                </div>
                                <Badge variant="secondary" className="w-full justify-center py-1 mt-2">
                                    {order.hinh_thuc_thanh_toan}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}