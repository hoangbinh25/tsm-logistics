"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

function VNPayReturnContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode')
    const vnp_TxnRef = searchParams.get('vnp_TxnRef')

    const [isSuccess, setIsSuccess] = useState(false)
    const [orderCode, setOrderCode] = useState("")
    const [loading, setLoading] = useState(true)
    const [syncError, setSyncError] = useState(false)
    const [backendMessage, setBackendMessage] = useState("")

    useEffect(() => {
        const syncPayment = async () => {
            if (vnp_TxnRef) {
                setOrderCode(vnp_TxnRef.split('_')[0])
            }

            if (vnp_ResponseCode === '00') {
                try {
                    const queryString = window.location.search;
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
                    const res = await fetch(`${baseUrl}/orders/vnpay-ipn${queryString}`, {
                        method: 'GET'
                    });

                    const data = await res.json();
                    console.log("Backend IPN Response:", data);

                    if (res.ok && data.RspCode === '00') {
                        setIsSuccess(true)
                    } else {
                        console.error("Backend confirm failed:", data);
                        setBackendMessage(data.Message || "Lỗi xác thực giao dịch")
                        setSyncError(true)
                    }
                } catch (error) {
                    console.error("Lỗi đồng bộ thanh toán:", error);
                    setSyncError(true)
                    setBackendMessage("Không thể kết nối tới máy chủ")
                }
            } else {
                setIsSuccess(false)
            }
            setLoading(false)
        };

        syncPayment();
    }, [vnp_ResponseCode, vnp_TxnRef])

    if (loading) {
        return (
            <main className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Đang xác thực giao dịch với hệ thống...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border">
                {isSuccess ? (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Thanh toán thành công!</h1>
                        <p className="text-slate-500 mb-6">
                            Cảm ơn bạn. Giao dịch cho đơn hàng <strong>{orderCode}</strong> đã được thực hiện thành công.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            {syncError ? "Lỗi đồng bộ dữ liệu" : "Thanh toán thất bại"}
                        </h1>
                        <p className="text-slate-500 mb-6">
                            {syncError
                                ? `Lỗi: ${backendMessage}`
                                : `Giao dịch cho đơn hàng ${orderCode} đã bị hủy hoặc xảy ra lỗi.`}
                        </p>
                    </>
                )}

                <div className="flex flex-col gap-3">
                    {orderCode && (
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => router.push(`/orders`)}
                        >
                            Xem danh sách đơn hàng
                        </Button>
                    )}
                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Về trang chủ
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default function VNPayReturnPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <Suspense fallback={
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">Đang khởi tạo...</p>
                    </div>
                </main>
            }>
                <VNPayReturnContent />
            </Suspense>
            <Footer />
        </div>
    )
}
