"use client"

import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Package, MapPin, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { fetchWithAuth } from "@/utils/api"

export function TrackingSection() {
    const router = useRouter()
    const { user } = useAuth()

    const [trackingNumber, setTrackingNumber] = useState("")
    const [loading, setLoading] = useState(false)
    const [orderData, setOrderData] = useState<any>(null)
    const [error, setError] = useState("")

    const handleSearch = async () => {
        if (!trackingNumber.trim()) return;

        // 3. Kiểm tra đăng nhập trước khi gọi
        if (!user) {
            setError("Vui lòng đăng nhập để tra cứu đơn hàng cá nhân.");
            return;
        }

        setLoading(true);
        setError("");
        setOrderData(null);

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/orders/tracking/${trackingNumber}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw { response: { status: res.status, data: errorData } };
            }
            const payload = await res.json();
            setOrderData(payload.data)

        } catch (err: any) {
            console.error("Lỗi tra cứu:", err);

            // 5. Bắt lỗi chính xác từ Backend (Service ném ra)
            if (err.response?.status === 403) {
                setError("Bạn không có quyền xem đơn hàng này (Không chính chủ).");
            } else if (err.response?.status === 404) {
                setError("Không tìm thấy mã vận đơn này.");
            } else {
                setError("Có lỗi xảy ra. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    }

    const getStepStatus = (stepIndex: number, currentStatus: string) => {
        const statusLevel: Record<string, number> = {
            'TAO_MOI': 1, 'CHO_XAC_NHAN': 1,
            'DA_PHAN_CONG': 2, 'DANG_LAY_HANG': 2,
            'DANG_VAN_CHUYEN': 3,
            'DA_GIAO': 4, 'DA_HUY': -1
        };
        const currentLevel = statusLevel[currentStatus] || 0;
        if (currentLevel === -1) return -1;
        if (currentLevel > stepIndex) return 2;
        if (currentLevel === stepIndex) return 1;
        return 0;
    };

    const renderIconStyle = (status: number) => {
        if (status === 2) return "bg-green-100 text-green-600";
        if (status === 1) return "bg-blue-100 text-blue-600 animate-pulse";
        return "bg-muted text-muted-foreground";
    };

    return (
        <section id="theo-doi" className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                {/* ... Code UI Header ... */}
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Theo dõi đơn hàng</h2>
                </div>

                <Card className="max-w-3xl mx-auto p-6 md:p-8 shadow-lg bg-white">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            placeholder="Nhập mã vận đơn..."
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="h-12 text-base"
                        />
                        <Button size="lg" className="h-12 px-8" onClick={handleSearch} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : "Tra cứu"}
                        </Button>
                    </div>

                    {/* Hiển thị lỗi màu đỏ */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-center gap-2 text-sm border border-red-100">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {/* Hiển thị Kết quả Timeline */}
                    <AnimatePresence>
                        {orderData && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-8 pt-8 border-t border-border overflow-hidden"
                            >
                                <div className="mb-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">Đơn: {orderData.ma_don_hang}</h3>
                                        <p className="text-sm text-gray-500">
                                            Ngày tạo: {format(new Date(orderData.thoi_gian_tao), "dd/MM/yyyy HH:mm")}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold">
                                        {orderData.trang_thai_don_hang}
                                    </span>
                                </div>

                                {/* Timeline Icons */}
                                <div className="grid gap-6 md:grid-cols-4 relative">
                                    {/* Copy lại phần Grid Timeline từ bài trước vào đây */}
                                    <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-gray-100 -z-10"></div>

                                    {/* Ví dụ 1 icon */}
                                    <div className="flex flex-col items-center gap-2 bg-white">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${renderIconStyle(getStepStatus(1, orderData.trang_thai_don_hang))}`}>
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-medium">Đơn mới</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 bg-white">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${renderIconStyle(getStepStatus(2, orderData.trang_thai_don_hang))}`}>
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-medium">Đã phân công</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 bg-white">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${renderIconStyle(getStepStatus(3, orderData.trang_thai_don_hang))}`}>
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-medium">Đang giao</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 bg-white">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${renderIconStyle(getStepStatus(4, orderData.trang_thai_don_hang))}`}>
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-medium">Đã giao</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </section>
    )
}