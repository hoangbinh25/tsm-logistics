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
    Truck, CheckCircle, Package, User, CreditCard, QrCode
} from "lucide-react"
import { format } from "date-fns"
import { QRCodeSVG } from "qrcode.react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export default function OrderDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { http } = useAuth()
    const { toast } = useToast()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [paymentUrl, setPaymentUrl] = useState<string>("")
    const [isQRModalOpen, setIsQRModalOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<string>("PENDING")

    // Polling thanh toán
    useEffect(() => {
        let interval: any;
        if (isQRModalOpen && paymentStatus !== 'SUCCESS') {
            interval = setInterval(async () => {
                try {
                    const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/payment-status`)
                    if (res.ok) {
                        const data = await res.json()
                        if (data.status === 'SUCCESS') {
                            setPaymentStatus('SUCCESS')
                            clearInterval(interval)
                            toast({ title: "Thành công", description: "Thanh toán đã được xác nhận!" })
                            setTimeout(() => {
                                setIsQRModalOpen(false)
                                fetchOrderDetail()
                            }, 2000)
                        }
                    }
                } catch (error) {
                    console.error("Lỗi check status:", error)
                }
            }, 10000) // 10 giây check 1 lần cho đỡ tốn tài nguyên
        }
        return () => clearInterval(interval)
    }, [isQRModalOpen, paymentStatus, id, http])

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

    useEffect(() => {
        if (id) fetchOrderDetail()
    }, [id, http])

    const handlePayment = async () => {
        setIsProcessing(true)
        try {
            const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/payment-link`)
            if (res.ok) {
                const data = await res.json()
                setPaymentUrl(data.paymentUrl)
                setIsQRModalOpen(true)
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể lấy link thanh toán",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Lỗi kết nối",
                variant: "destructive"
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSwitchToCOD = async () => {
        if (!confirm("Bạn có chắc muốn chuyển sang thanh toán COD không?")) return

        setIsProcessing(true)
        try {
            const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/switch-cod`, {
                method: 'POST'
            })
            if (res.ok) {
                toast({
                    title: "Thành công",
                    description: "Đã chuyển sang COD thành công"
                })
                fetchOrderDetail()
            } else {
                toast({
                    title: "Lỗi",
                    description: "Lỗi chuyển đổi",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Lỗi kết nối",
                variant: "destructive"
            })
        } finally {
            setIsProcessing(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
    if (!order) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy đơn hàng</div>

    const latestPayment = order.thanh_toan?.[0]
    const isPaid = latestPayment?.trang_thai === 'SUCCESS'
    const isOnline = order.hinh_thuc_thanh_toan !== 'COD'

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
                            <Badge className="text-base px-3 py-1 bg-blue-600 hover:bg-blue-700">{order.trang_thai_don_hang}</Badge>
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Ngày đặt: {format(new Date(order.thoi_gian_tao), "dd/MM/yyyy HH:mm")}
                        </p>
                    </div>
                    {/* Nút xem Tracking công khai nếu muốn gửi cho người khác */}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/tracking/${order.ma_don_hang}`)}>
                            Xem Tracking
                        </Button>
                        <Button variant="outline" size="icon" title="In vận đơn">
                            <Package className="w-4 h-4" />
                        </Button>
                    </div>
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
                                <div className="absolute left-7 top-10 bottom-10 w-0.5 bg-slate-200"></div>

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
                        {/* Thanh toán */}
                        <Card className={!isPaid && isOnline ? "border-orange-200 bg-orange-50/30" : ""}>
                            <CardHeader>
                                <CardTitle className="text-base flex justify-between items-center">
                                    Thanh toán
                                    {isPaid ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Đã thanh toán</Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-orange-300 text-orange-700">Chờ thanh toán</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
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
                                <div className="p-3 bg-white rounded-md border text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CreditCard className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium">Phương thức: {order.hinh_thuc_thanh_toan}</span>
                                    </div>
                                    {!isPaid && (
                                        <p className="text-xs text-slate-500">Mã đơn: {order.ma_don_hang}</p>
                                    )}
                                </div>

                                {!isPaid && isOnline && (
                                    <div className="space-y-2 mt-4">
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                                            onClick={handlePayment}
                                            disabled={isProcessing}
                                        >
                                            <QrCode className="w-4 h-4" /> Thanh toán QR
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={handleSwitchToCOD}
                                            disabled={isProcessing}
                                        >
                                            Chuyển sang COD
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

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
                    </div>
                </div>
            </main>
            <Footer />

            {/* Modal QR Code */}
            <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Quét mã QR để thanh toán</DialogTitle>
                        <DialogDescription>
                            Sử dụng ứng dụng ngân hàng hoặc ví điện tử (MoMo/VNPay) để quét mã bên dưới.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                        <div className="p-4 bg-white rounded-xl shadow-inner border relative group">
                            {paymentUrl && (
                                <img
                                    src={paymentUrl}
                                    alt="Payment QR"
                                    className="w-[280px] h-[280px] object-contain"
                                />
                            )}
                            {paymentStatus === 'SUCCESS' && (
                                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-500">
                                    <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
                                    <p className="font-bold text-green-600">Thanh toán thành công!</p>
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-lg text-blue-700">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tong_thanh_toan)}
                            </p>
                            <p className="text-sm font-medium text-slate-700">Nội dung: <span className="text-blue-600 font-mono italic">{order.ma_don_hang}</span></p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Mã đơn hàng: {order.ma_don_hang}</p>
                        </div>
                        <div className="w-full flex flex-col gap-2">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => setIsQRModalOpen(false)}
                            >
                                {paymentStatus === 'SUCCESS' ? "Hoàn tất" : "Tôi đang thanh toán..."}
                            </Button>
                        </div>
                        <p className="text-[10px] text-slate-400 italic">
                            * Vui lòng không đóng trang này cho đến khi giao dịch được xác nhận tự động.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}