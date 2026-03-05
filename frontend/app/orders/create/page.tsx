"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AddressSelector } from "@/components/address-selector"
import { useWarehouses } from "@/hooks/use-warehouses"
import { Warehouse } from "@/types/warehouse"
import { useServices, Service } from "@/hooks/use-services"
import { useOrderMutations } from "@/hooks/use-orders"

export default function CreateOrderPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    // State quản lý form
    const [receiver, setReceiver] = useState({ name: "", phone: "" })
    const [item, setItem] = useState({
        name: "",
        weight: "",
        quantity: 1,
        value: "",
        codAmount: "",
        length: "",
        width: "",
        height: ""
    })
    const [payer, setPayer] = useState("SENDER")
    const [paymentMethod, setPaymentMethod] = useState("COD")
    const [note, setNote] = useState("")
    const [selectedAddress, setSelectedAddress] = useState({
        province: "",
        district: "",
        ward: "",
        detail: ""
    })

    const [warehouseId, setWarehouseId] = useState("")
    const [serviceId, setServiceId] = useState("")

    // 1. Fetch dữ liệu với hooks
    const { data: warehouses = [], isLoading: isLoadingWarehouses } = useWarehouses()
    const { data: services = [], isLoading: isLoadingServices } = useServices()
    const { createMutation } = useOrderMutations()

    // Tự động chọn giá trị đầu tiên
    useEffect(() => {
        if (warehouses.length > 0 && !warehouseId) setWarehouseId(warehouses[0].id)
    }, [warehouses, warehouseId])

    useEffect(() => {
        if (services.length > 0 && !serviceId) setServiceId(services[0].id)
    }, [services, serviceId])

    const isLoadingData = isLoadingWarehouses || isLoadingServices
    const isSubmitting = createMutation.isPending

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!warehouseId || !serviceId) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng chọn Kho và Dịch vụ", variant: "destructive" })
            return;
        }

        const fullAddress = `${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`

        const payload = {
            senderInfo: { address: user?.dia_chi || "Văn phòng chính" },
            receiverInfo: { ...receiver, address: fullAddress },
            warehouseId: warehouseId,
            serviceId: serviceId,
            paymentMethod: paymentMethod,
            payer: payer,
            note: note,
            items: [
                {
                    ten_hang: item.name,
                    mo_ta: "",
                    so_luong: Number(item.quantity),
                    don_vi: "Kien",
                    khoi_luong: Number(item.weight),
                    kich_thuoc: `${item.length}x${item.width}x${item.height}`,
                    gia_tri: Number(item.value),
                    tien_cod: Number(item.codAmount || 0)
                }
            ]
        }

        createMutation.mutate(payload, {
            onSuccess: (data: any) => {
                toast({
                    title: "Tạo đơn thành công!",
                    description: `Mã vận đơn: ${data.data.ma_don_hang}.`,
                    className: "bg-green-50 border-green-200 text-green-900"
                })

                // Nếu chọn ONLINE, chuyển thẳng đến trang chi tiết để họ thấy nút VNPay
                router.push(`/orders/${data.data.id}`)
            },
            onError: (error: any) => {
                toast({ title: "Tạo đơn thất bại", description: error.message, variant: "destructive" })
            }
        })
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-10 bg-gray-50/50">
                <div className="container mx-auto py-10 px-4 max-w-4xl">
                    <h1 className="text-2xl font-bold mb-6">Tạo vận đơn mới</h1>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Cột Trái: Thông tin vận chuyển */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>1. Thông tin Vận chuyển</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Select Kho Hàng */}
                                    <div className="space-y-2">
                                        <Label>Kho gửi hàng {isLoadingData && <Loader2 className="inline w-3 h-3 animate-spin" />}</Label>
                                        <Select value={warehouseId} onValueChange={setWarehouseId} disabled={isLoadingData}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingData ? "Đang tải kho..." : "Chọn kho hàng"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {warehouses.map((w: Warehouse) => (
                                                    <SelectItem key={w.id} value={w.id}>{w.ten_kho}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Select Dịch Vụ */}
                                    <div className="space-y-2">
                                        <Label>Dịch vụ vận chuyển {isLoadingData && <Loader2 className="inline w-3 h-3 animate-spin" />}</Label>
                                        <Select value={serviceId} onValueChange={setServiceId} disabled={isLoadingData}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingData ? "Đang tải dịch vụ..." : "Chọn dịch vụ"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services.map((s: Service) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.ten_dich_vu} ({new Intl.NumberFormat('vi-VN').format(Number(s.gia_co_ban))}đ/{s.don_vi_tinh})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="border-t pt-4 space-y-4">
                                        <Label className="text-base font-semibold">Người nhận</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input placeholder="Họ tên" value={receiver.name} onChange={e => setReceiver({ ...receiver, name: e.target.value })} required />
                                            <Input placeholder="SĐT" value={receiver.phone} onChange={e => setReceiver({ ...receiver, phone: e.target.value })} required />
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <AddressSelector
                                                province={selectedAddress.province}
                                                district={selectedAddress.district}
                                                ward={selectedAddress.ward}
                                                onProvinceChange={(val) => setSelectedAddress({ ...selectedAddress, province: val, district: "", ward: "" })}
                                                onDistrictChange={(val) => setSelectedAddress({ ...selectedAddress, district: val, ward: "" })}
                                                onWardChange={(val) => setSelectedAddress({ ...selectedAddress, ward: val })}
                                                className="grid-cols-1 md:grid-cols-3"
                                            />
                                            <Input placeholder="Số nhà, tên đường..." value={selectedAddress.detail} onChange={e => setSelectedAddress({ ...selectedAddress, detail: e.target.value })} required />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>2. Thanh toán</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label>Cước phí thanh toán bởi</Label>
                                        <Select value={payer} onValueChange={setPayer}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SENDER">Người gửi trả</SelectItem>
                                                <SelectItem value="RECEIVER">Người nhận trả</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="COD">Thu hộ (COD) & Tiền mặt</SelectItem>
                                            <SelectItem value="ONLINE" className="text-blue-600 font-medium">💳 Thanh toán qua VNPay</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-muted-foreground border">
                                        {paymentMethod === 'ONLINE' && "Bạn sẽ được chuyển đến chi tiết đơn hàng để thực hiện thanh toán trực tuyến qua VNPay."}
                                        {paymentMethod === 'COD' && "Thanh toán cho tài xế khi nhận hàng."}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Cột Phải: Hàng hóa */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>3. Hàng hóa</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Tên hàng hóa</Label>
                                        <Input value={item.name} onChange={e => setItem({ ...item, name: e.target.value })} required placeholder="VD: Quần áo, Sách vở..." />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>SL (kiện)</Label>
                                            <Input type="number" min="1" value={item.quantity} onChange={e => setItem({ ...item, quantity: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>KL (kg)</Label>
                                            <Input type="number" value={item.weight} onChange={e => setItem({ ...item, weight: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Giá trị (VNĐ)</Label>
                                            <Input type="number" value={item.value} onChange={e => setItem({ ...item, value: e.target.value })} required placeholder="0" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Dài (cm)</Label>
                                            <Input type="number" placeholder="0" value={item.length} onChange={e => setItem({ ...item, length: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Rộng (cm)</Label>
                                            <Input type="number" placeholder="0" value={item.width} onChange={e => setItem({ ...item, width: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Cao (cm)</Label>
                                            <Input type="number" placeholder="0" value={item.height} onChange={e => setItem({ ...item, height: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t">
                                        <Label className="text-blue-600 font-bold">Số tiền thu hộ (COD)</Label>
                                        <Input
                                            type="number"
                                            placeholder="Nhập số tiền cần tài xế thu hộ..."
                                            value={item.codAmount}
                                            onChange={e => setItem({ ...item, codAmount: e.target.value })}
                                            className="border-blue-200 focus:border-blue-500"
                                        />
                                        <p className="text-[10px] text-muted-foreground italic">* Để trống nếu không thu hộ tiền hàng</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ghi chú</Label>
                                        <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú cho tài xế (VD: Hàng dễ vỡ, gọi trước khi giao...)" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-50">
                                <CardContent className="pt-6">
                                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || isLoadingData}>
                                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> :
                                            (paymentMethod === 'ONLINE') ? "Tiếp tục thanh toán »" : "Tạo đơn ngay"
                                        }
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    )
}