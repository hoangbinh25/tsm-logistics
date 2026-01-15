"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle2, MapPin, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header" 
import { Footer } from "@/components/footer" 

// Map trạng thái sang các bước hiển thị
const STEPS = [
    { status: 'TAO_MOI', label: 'Đơn mới', icon: Package },
    { status: 'DA_PHAN_CONG', label: 'Đã phân công', icon: MapPin }, 
    { status: 'DANG_VAN_CHUYEN', label: 'Đang giao', icon: Truck },
    { status: 'DA_GIAO', label: 'Đã giao', icon: CheckCircle2 },
]

export default function TrackingPage() {
    const { code } = useParams() // Lấy mã đơn hàng từ URL
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Gọi API Public vừa tạo
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/tracking/${code}`)
                if (res.ok) {
                    const data = await res.json()
                    setOrder(data.data)
                } else {
                    setError(true)
                }
            } catch (err) {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        if(code) fetchOrder()
    }, [code])

    // Helper: Xác định trạng thái hiện tại đang ở bước nào
    const getCurrentStepIndex = (status: string) => {
        if (!status) return 0
        // Logic mapping đơn giản (bạn có thể map kỹ hơn tuỳ enum trong DB)
        if (status === 'DA_GIAO') return 3
        if (status === 'DANG_VAN_CHUYEN') return 2
        if (['DA_PHAN_CONG', 'DANG_LAY_HANG'].includes(status)) return 1
        return 0
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
    
    if (error || !order) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold text-red-600">Không tìm thấy đơn hàng</h1>
            <p className="text-gray-500">Mã vận đơn {code} không tồn tại hoặc đã bị xóa.</p>
            <Button asChild><Link href="/">Về trang chủ</Link></Button>
        </div>
    )

    const currentStep = getCurrentStepIndex(order.trang_thai_don_hang)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            
            <main className="flex-1 container mx-auto py-10 px-4 max-w-3xl">
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại trang chủ
                </Link>

                <div className="space-y-6">
                    {/* Header đơn hàng */}
                    <div className="bg-blue-600 text-white p-6 rounded-t-xl shadow-lg flex justify-between items-center">
                        <div>
                            <p className="text-blue-100 text-sm">Mã vận đơn</p>
                            <h1 className="text-3xl font-bold tracking-wider">{order.ma_don_hang}</h1>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-blue-100 text-sm">Ngày tạo</p>
                            <p className="font-medium">
                                {new Date(order.thoi_gian_tao || order.thoi_gian_dat).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>

                    {/* Timeline Trạng thái */}
                    <Card className="rounded-b-xl rounded-t-none border-t-0 shadow-lg mt-0">
                        <CardContent className="pt-10 pb-10">
                            <div className="relative flex justify-between items-center w-full px-2 sm:px-10">
                                {/* Thanh Progress Bar Nền */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 z-0 transform -translate-y-1/2 mx-10 sm:mx-14" style={{width: 'calc(100% - 5rem)'}} />
                                
                                {/* Thanh Progress Bar Màu (Chạy theo tiến độ) */}
                                <div 
                                    className="absolute top-1/2 left-0 h-1 bg-green-500 z-0 transform -translate-y-1/2 transition-all duration-1000 mx-10 sm:mx-14" 
                                    style={{ width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 5rem)` }} 
                                />

                                {/* Các Nút Steps */}
                                {STEPS.map((step, index) => {
                                    const isCompleted = index <= currentStep
                                    const isCurrent = index === currentStep
                                    
                                    return (
                                        <div key={index} className="relative z-10 flex flex-col items-center">
                                            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                                isCompleted 
                                                    ? 'bg-green-500 border-green-200 text-white' 
                                                    : 'bg-white border-gray-200 text-gray-300'
                                            }`}>
                                                <step.icon className="w-5 h-5 sm:w-7 sm:h-7" />
                                            </div>
                                            <p className={`mt-3 text-xs sm:text-sm font-semibold whitespace-nowrap ${
                                                isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                                            }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thông tin chi tiết */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Thông tin người nhận</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="font-medium text-gray-900">{order.dia_chi_nhan}</p>
                                        <p className="text-sm text-gray-500">
                                            {/* Logic mask số điện thoại để bảo mật nếu cần */}
                                            {/* order.nguoi_nhan_sdt */}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-base">Chi tiết thanh toán</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Hình thức</span>
                                    <Badge variant="outline">{order.hinh_thuc_thanh_toan}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tổng thu (COD)</span>
                                    <span className="font-bold text-lg text-red-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tong_thanh_toan)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}