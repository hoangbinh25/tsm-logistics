"use client"

import { useOrders, useOrderMutations } from "@/hooks/use-orders"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Package, Plus, Loader2, ArrowRight } from "lucide-react"

// 1. Các hàm Helper định dạng (Tiền, Ngày, Trạng thái)
const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

// Map trạng thái sang tiếng Việt và màu sắc
const getStatusInfo = (status: string) => {
    switch (status) {
        case 'TAO_MOI':
            return { label: "Mới tạo", color: "bg-blue-100 text-blue-800 hover:bg-blue-100" };
        case 'DA_LAY_HANG':
            return { label: "Đã lấy hàng", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" };
        case 'DANG_GIAO':
            return { label: "Đang giao", color: "bg-purple-100 text-purple-800 hover:bg-purple-100" };
        case 'GIAO_THANH_CONG':
            return { label: "Thành công", color: "bg-green-100 text-green-800 hover:bg-green-100" };
        case 'HUY':
            return { label: "Đã hủy", color: "bg-red-100 text-red-800 hover:bg-red-100" };
        default:
            return { label: status, color: "bg-gray-100 text-gray-800" };
    }
}

interface Order {
    id: string;
    ma_don_hang: string;
    dia_chi_nhan: string;
    thoi_gian_dat: string;
    hinh_thuc_thanh_toan: string;
    tong_thanh_toan: number;
    trang_thai_don_hang: string;
}

export default function MyOrdersPage() {
    const router = useRouter()

    // 2. Fetch API lấy danh sách với React Query Hooks
    const { data: dataResponse, isLoading } = useOrders()
    const { cancelMutation } = useOrderMutations()

    const orders = Array.isArray(dataResponse?.data) ? dataResponse.data : (Array.isArray(dataResponse) ? dataResponse : [])

    const handleCancel = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
            cancelMutation.mutate(id, {
                onSuccess: () => {
                    alert("Hủy đơn hàng thành công!");
                },
                onError: (error: any) => {
                    alert(error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng");
                }
            })
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 py-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Tiêu đề & Nút tạo mới */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Quản lý đơn hàng</h1>
                            <p className="text-muted-foreground mt-1">Xem lại lịch sử vận chuyển của bạn</p>
                        </div>
                        <Link href="/orders/create">
                            <Button className="shadow-lg">
                                <Plus className="w-4 h-4 mr-2" /> Tạo đơn mới
                            </Button>
                        </Link>
                    </div>

                    {/* Nội dung chính */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20 bg-white rounded-lg shadow-sm">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    ) : orders.length === 0 ? (
                        // Trường hợp chưa có đơn nào
                        <Card className="text-center py-16 border-dashed">
                            <CardContent>
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 bg-slate-100 rounded-full">
                                        <Package className="w-12 h-12 text-slate-400" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
                                <p className="text-muted-foreground mb-6">Bạn chưa tạo đơn vận chuyển nào trên hệ thống.</p>
                                <Link href="/orders/create">
                                    <Button variant="outline">Tạo đơn hàng đầu tiên</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        // Bảng danh sách đơn hàng
                        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-37.5">Mã vận đơn</TableHead>
                                        <TableHead>Người nhận</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead>Thanh toán</TableHead>
                                        <TableHead>Tổng tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => {
                                        const status = getStatusInfo(order.trang_thai_don_hang)
                                        return (
                                            <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                                                <TableCell className="font-medium text-primary">
                                                    {order.ma_don_hang}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm truncate max-w-50">
                                                            {order.dia_chi_nhan.split(' - ')[0]}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-50">
                                                            {order.dia_chi_nhan.split(' - ')[2] || order.dia_chi_nhan}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {formatDate(order.thoi_gian_dat)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {order.hinh_thuc_thanh_toan}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-bold text-slate-900">
                                                    {formatMoney(order.tong_thanh_toan)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`hover:opacity-100 ${status.color} border-0`}>
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right flex items-center justify-end gap-2">
                                                    {!['DA_GIAO', 'DA_HUY', 'GIAO_KHONG_THANH_CONG'].includes(order.trang_thai_don_hang) && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="h-8 bg-red-500 hover:bg-red-600"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleCancel(order.id);
                                                            }}
                                                            disabled={cancelMutation.isPending}
                                                        >
                                                            Hủy đơn
                                                        </Button>
                                                    )}
                                                    <Link href={`/orders/${order.id}`}>
                                                        <Button variant="outline" size="sm" className="h-8">
                                                            Chi tiết
                                                            <ArrowRight className="h-4 w-4 ml-1" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}