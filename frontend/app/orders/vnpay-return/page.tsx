"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VNPayReturnPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode')
    const vnp_TxnRef = searchParams.get('vnp_TxnRef')

    const [isSuccess, setIsSuccess] = useState(false)
    const [orderCode, setOrderCode] = useState("")

    useEffect(() => {
        if (vnp_TxnRef) {
            setOrderCode(vnp_TxnRef.split('_')[0])
        }
        if (vnp_ResponseCode === '00') {
            setIsSuccess(true)

            const syncPaymentWithBackend = async () => {
                try {
                    const queryString = window.location.search;
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888/api"}/orders/vnpay-ipn${queryString}`, {
                        method: 'GET'
                    });
                } catch (error) {
                    console.error("Lỗi đồng bộ thanh toán:", error);
                }
            };
            syncPaymentWithBackend();
        }
    }, [vnp_ResponseCode, vnp_TxnRef])

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

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
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Thanh toán thất bại</h1>
                            <p className="text-slate-500 mb-6">
                                Giao dịch cho đơn hàng <strong>{orderCode}</strong> đã bị hủy hoặc xảy ra lỗi.
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

            <Footer />
        </div>
    )
}
