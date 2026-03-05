"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft, Phone, Mail, Building2, Receipt, PhoneCall,
    MapPin, Clock, Truck, MoreHorizontal, UserCircle,
    CreditCard, LayoutDashboard, History, Wallet, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchWithAuth } from "@/utils/api"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function CustomerDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [customer, setCustomer] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users/customers/${id}`)
                if (res.ok) {
                    const payload = await res.json()
                    setCustomer(payload.data)
                }
            } catch (error) {
                console.error("Lỗi tải chi tiết khách hàng", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDetail()
    }, [id])

    if (loading) return <div className="flex h-[80vh] items-center justify-center p-6"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
    if (!customer) return <div className="p-6 text-center text-red-600">Không tìm thấy khách hàng.</div>

    const formatCurrency = (amount: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount))

    const profile = customer.khach_hang_profile
    const addressBook = customer.so_dia_chi || []
    const orderHistory = customer.don_hang_khach || []

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8 hover:bg-slate-100 border-none transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        {customer.ho_ten}
                        <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50/50">Khách hàng</Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground">ID: {customer.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cột trái: Thông tin khách hàng & Công nợ */}
                <div className="md:col-span-1 space-y-6">
                    {/* Thông tin cá nhân/Công ty */}
                    <Card className="border-none shadow-sm shadow-slate-200">
                        <CardHeader className="pb-3 flex-row items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                                {customer.anh_dai_dien ? <img src={customer.anh_dai_dien} className="w-full h-full object-cover" /> : <UserCircle className="w-6 h-6 text-slate-400" />}
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-lg">Hồ sơ liên hệ</CardTitle>
                                <CardDescription>Dành cho liên hệ trực tiếp</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <div className="flex items-start gap-3">
                                <Phone className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold text-slate-700">Số điện thoại</p>
                                    <p className="text-slate-600">{customer.so_dien_thoai || "Chưa cập nhật"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold text-slate-700">Email</p>
                                    <p className="text-slate-600">{customer.email || "Chưa cập nhật"}</p>
                                </div>
                            </div>
                            {profile?.ten_cong_ty && (
                                <>
                                    <div className="border-t pt-4 border-slate-100" />
                                    <div className="flex items-start gap-3">
                                        <Building2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-slate-700 uppercase text-[10px] tracking-wider">Doanh nghiệp</p>
                                            <p className="text-slate-900 font-bold">{profile.ten_cong_ty}</p>
                                            <p className="text-xs text-slate-500 mt-1">MST: {profile.ma_so_thue || "---"}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Công nợ hiện tại */}
                    <Card className="border-none shadow-sm shadow-blue-200/50 bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative group">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white/80 text-sm font-medium uppercase tracking-widest flex items-center gap-2">
                                <Wallet className="h-4 w-4" /> Tổng mức dư nợ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="text-3xl font-bold mb-4">{formatCurrency(profile?.du_no_hien_tai || 0)}</div>
                            <div className="flex justify-between items-center text-xs text-white/70">
                                <span>Hạn mức cho phép: <span className="text-white/100 font-semibold">{formatCurrency(profile?.han_muc_cong_no || 0)}</span></span>
                            </div>
                            <div className="mt-4 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (Number(profile?.du_no_hien_tai) / Number(profile?.han_muc_cong_no || 1)) * 100)}%` }}
                                />
                            </div>
                        </CardContent>
                        {/* Họa tiết nhẹ nhàng nền */}
                        <CreditCard className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
                    </Card>
                </div>

                {/* Cột chính: Tabs */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="HISTORY" className="w-full">
                        <TabsList className="bg-slate-100 grid md:inline-flex grid-cols-2 h-auto p-1 border border-slate-200">
                            <TabsTrigger value="HISTORY" className="gap-2 rounded-md"><History className="h-4 w-4" /> Lịch sử đơn</TabsTrigger>
                            <TabsTrigger value="ADDRESSES" className="gap-2 rounded-md"><MapPin className="h-4 w-4" /> Sổ địa chỉ ({addressBook.length})</TabsTrigger>
                        </TabsList>

                        {/* TAB LỊCH SỬ ĐƠN */}
                        <TabsContent value="HISTORY" className="mt-6">
                            <Card className="border-slate-100 shadow-sm shadow-slate-200">
                                <div className="overflow-hidden bg-white rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b text-[10px] uppercase text-slate-500 font-bold">
                                            <tr>
                                                <th className="px-4 py-3">Đơn hàng</th>
                                                <th className="px-4 py-3">Lộ trình</th>
                                                <th className="px-4 py-3">Giá trị</th>
                                                <th className="px-4 py-3">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {orderHistory.length === 0 ? (
                                                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400 italic">Chưa có đơn hàng nào được tạo.</td></tr>
                                            ) : orderHistory.map((order: any) => (
                                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/orders`)}>
                                                    <td className="px-4 py-4">
                                                        <div className="font-bold text-blue-700">{order.ma_don_hang}</div>
                                                        <div className="text-[10px] text-slate-400">{format(new Date(order.thoi_gian_tao), "dd/MM/yyyy HH:mm")}</div>
                                                    </td>
                                                    <td className="px-4 py-4 text-xs">
                                                        <p className="truncate max-w-[150px]">{order.dia_chi_nhan}</p>
                                                    </td>
                                                    <td className="px-4 py-4 font-bold text-slate-800">
                                                        {formatCurrency(order.tong_thanh_toan)}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge variant="outline" className={`text-[10px] uppercase font-bold border-none px-2 py-0 ${['DA_GIAO', 'SUCCESS'].includes(order.trang_thai_don_hang || order.thanh_toan?.[0]?.trang_thai) ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {order.trang_thai_don_hang}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </TabsContent>

                        {/* TAB SỔ ĐỊA CHỈ */}
                        <TabsContent value="ADDRESSES" className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {addressBook.length === 0 ? (
                                    <div className="col-span-full py-10 bg-white border border-dashed rounded-xl flex flex-col items-center justify-center gap-3 text-slate-400">
                                        <MapPin className="w-8 h-8 opacity-20" />
                                        <p className="text-sm">Chưa có địa chỉ nào được lưu.</p>
                                    </div>
                                ) : addressBook.map((addr: any) => (
                                    <Card key={addr.id} className={`border-slate-100 shadow-sm hover:shadow-md transition-all ${addr.is_default ? 'border-l-4 border-l-primary' : ''}`}>
                                        <CardContent className="p-4 pt-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 w-full flex items-center justify-between">
                                                    {addr.ho_ten}
                                                    {addr.is_default && <Badge variant="outline" className="text-[8px] h-4 bg-primary/5 text-primary border-primary/20">Mặc định</Badge>}
                                                </div>
                                            </div>
                                            <p className="text-blue-600 font-semibold text-xs flex items-center gap-2 mt-2">
                                                <PhoneCall className="w-3 h-3 shrink-0" />
                                                {addr.so_dien_thoai}
                                            </p>
                                            <p className="text-slate-500 text-xs mt-3 flex items-start gap-2 leading-relaxed">
                                                <MapPin className="w-3 h-3 mt-1 shrink-0 text-slate-400" />
                                                {addr.dia_chi_chi_tiet}, {addr.phuong_xa}, {addr.quan_huyen}, {addr.tinh_thanh}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
