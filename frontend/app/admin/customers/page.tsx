"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Filter, UserCircle, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { fetchWithAuth } from "@/utils/api"
import { useRouter } from "next/navigation"

export default function CustomerManagementPage() {
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users?role=KHACH_HANG`)
                if (res.ok) {
                    const payload = await res.json()
                    setCustomers(payload.data || [])
                }
            } catch (error) {
                console.error("Lỗi tải khách hàng", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCustomers()
    }, [])

    const filteredCustomers = customers.filter(c =>
        c.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.so_dien_thoai?.includes(searchTerm)
    )

    const formatCurrency = (amount: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount))

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý Khách hàng</h1>
                    <p className="text-sm text-muted-foreground">Xem hồ sơ, lịch sử giao dịch và công nợ của khách hàng.</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo tên, email, SĐT..."
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 bg-white">
                    <Filter className="h-4 w-4" /> Bộ lọc
                </Button>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Khách hàng</th>
                            <th className="px-6 py-4">Liên hệ</th>
                            <th className="px-6 py-4">Doanh nghiệp</th>
                            <th className="px-6 py-4">Công nợ</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Đang tải dữ liệu...</td>
                            </tr>
                        ) : filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Không tìm thấy khách hàng nào.</td>
                            </tr>
                        ) : filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden">
                                            {customer.anh_dai_dien ? (
                                                <img src={customer.anh_dai_dien} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircle className="w-6 h-6 text-blue-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{customer.ho_ten}</div>
                                            <div className="text-xs text-muted-foreground">ID: {customer.id.substring(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">{customer.email || "---"}</div>
                                    <div className="text-xs text-muted-foreground">{customer.so_dien_thoai || "---"}</div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    {customer.khach_hang_profile?.ten_cong_ty || <span className="text-slate-400 italic font-normal">Cá nhân</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-red-600">
                                        {formatCurrency(customer.khach_hang_profile?.du_no_hien_tai || 0)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        Hạn mức: {formatCurrency(customer.khach_hang_profile?.han_muc_cong_no || 0)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline"
                                        className={customer.trang_thai_tai_khoan === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                                        {customer.trang_thai_tai_khoan}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                                                <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
