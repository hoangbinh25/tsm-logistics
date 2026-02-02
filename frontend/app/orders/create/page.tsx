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

// Định nghĩa kiểu dữ liệu khớp với Backend trả về
interface Warehouse { id: string; ten_kho: string; }
interface Service { id: string; ten_dich_vu: string; gia_co_ban: number; don_vi_tinh: string; }

export default function CreateOrderPage() {
  const { user, http } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // State quản lý form
  const [receiver, setReceiver] = useState({ name: "", phone: "", address: "" })
  const [item, setItem] = useState({ name: "", weight: "", quantity: 1, value: "" })
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [note, setNote] = useState("")

  // State dữ liệu API
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State lựa chọn (ID)
  const [warehouseId, setWarehouseId] = useState("")
  const [serviceId, setServiceId] = useState("")

  // 1. Fetch dữ liệu khi Component mount
  useEffect(() => {
    const fetchData = async () => {
        try {
            // Gọi song song 2 API
            const [resKho, resDV] = await Promise.all([
                // http tự động đính kèm token vào header
                http(`${process.env.NEXT_PUBLIC_API_URL}/warehouses`),
                http(`${process.env.NEXT_PUBLIC_API_URL}/services`)
            ])
            
            if (resKho.ok && resDV.ok) {
                const dataKho = await resKho.json()
                const dataDV = await resDV.json()
                
                setWarehouses(dataKho)
                setServices(dataDV)

                // Tự động chọn cái đầu tiên nếu danh sách có dữ liệu
                if (dataKho.length > 0) setWarehouseId(dataKho[0].id)
                if (dataDV.length > 0) setServiceId(dataDV[0].id)
            } else {
                console.error("Lỗi fetch data master")
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error)
            toast({ title: "Lỗi mạng", description: "Không tải được danh sách kho/dịch vụ", variant: "destructive" })
        } finally {
            setIsLoadingData(false)
        }
    }
    fetchData()
  }, [router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!warehouseId || !serviceId) {
        toast({ title: "Thiếu thông tin", description: "Vui lòng chọn Kho và Dịch vụ", variant: "destructive" })
        return;
    }

    setIsSubmitting(true)
    
    // Payload chuẩn gửi xuống Backend
    const payload = {
        senderInfo: { address: user?.dia_chi || "Văn phòng chính" },
        receiverInfo: receiver,
        warehouseId: warehouseId, 
        serviceId: serviceId,
        paymentMethod: paymentMethod,
        note: note,
        items: [
            {
                ten_hang: item.name,
                mo_ta: "",
                so_luong: Number(item.quantity),
                don_vi: "Kien",
                khoi_luong: Number(item.weight),
                don_gia: Number(item.value)
            }
        ]
    }

    try {
        const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
            method: "POST",
            body: JSON.stringify(payload)
        })

        const data = await res.json()

        if(res.ok) {
            if (data.paymentUrl) {
                 toast({ 
                    title: "Đang chuyển hướng...", 
                    description: `Vui lòng thanh toán qua cổng ${paymentMethod}`,
                    className: "bg-blue-50 text-blue-900"
                })
                // Chuyển hướng người dùng sang trang thanh toán của Momo/VNPay
                window.location.href = data.paymentUrl;
            } else {
                toast({ 
                    title: "Tạo đơn thành công!", 
                    description: `Mã vận đơn: ${data.data.ma_don_hang}. Đang gửi mail xác nhận...`,
                    duration: 5000,
                    className: "bg-green-50 border-green-200 text-green-900"
                })
                router.push("/orders") 
            }
        } else {
            throw new Error(data.message || "Có lỗi xảy ra")
        }
    } catch (error: any) {
        toast({ title: "Tạo đơn thất bại", description: error.message, variant: "destructive" })
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
        <Header/>
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
                                <Label>Kho gửi hàng {isLoadingData && <Loader2 className="inline w-3 h-3 animate-spin"/>}</Label>
                                <Select value={warehouseId} onValueChange={setWarehouseId} disabled={isLoadingData}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingData ? "Đang tải kho..." : "Chọn kho hàng"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.ten_kho}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
        
                            {/* Select Dịch Vụ */}
                            <div className="space-y-2">
                                <Label>Dịch vụ vận chuyển {isLoadingData && <Loader2 className="inline w-3 h-3 animate-spin"/>}</Label>
                                <Select value={serviceId} onValueChange={setServiceId} disabled={isLoadingData}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingData ? "Đang tải dịch vụ..." : "Chọn dịch vụ"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map(s => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.ten_dich_vu} ({new Intl.NumberFormat('vi-VN').format(Number(s.gia_co_ban))}đ/{s.don_vi_tinh})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
        
                            <div className="border-t pt-4">
                                <Label className="text-base font-semibold">Người nhận</Label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <Input placeholder="Họ tên" value={receiver.name} onChange={e => setReceiver({...receiver, name: e.target.value})} required />
                                    <Input placeholder="SĐT" value={receiver.phone} onChange={e => setReceiver({...receiver, phone: e.target.value})} required />
                                </div>
                                <Input className="mt-4" placeholder="Địa chỉ chi tiết (Số nhà, Phường/Xã...)" value={receiver.address} onChange={e => setReceiver({...receiver, address: e.target.value})} required />
                            </div>
                        </CardContent>
                    </Card>
        
                    <Card>
                         <CardHeader><CardTitle>2. Thanh toán</CardTitle></CardHeader>
                         <CardContent>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TIEN_MAT">Người gửi trả tiền mặt</SelectItem>
                                    <SelectItem value="COD">Thu hộ (COD)</SelectItem>
                                    <SelectItem value="MOMO" className="text-pink-600 font-medium">🌸 Ví MoMo</SelectItem>
                                    <SelectItem value="VNPAY" className="text-blue-600 font-medium">💳 VNPAY-QR</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-muted-foreground border">
                                {paymentMethod === 'MOMO' && "Bạn sẽ được chuyển hướng sang cổng thanh toán MoMo (Môi trường Test)."}
                                {paymentMethod === 'VNPAY' && "Bạn sẽ được chuyển hướng sang cổng thanh toán VNPAY (Môi trường Test)."}
                                {(paymentMethod === 'COD' || paymentMethod === 'TIEN_MAT') && "Tạo đơn hàng ngay lập tức."}
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
                                <Input value={item.name} onChange={e => setItem({...item, name: e.target.value})} required placeholder="VD: Quần áo, Sách vở..." />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                 <div className="space-y-2">
                                    <Label>SL (kiện)</Label>
                                    <Input type="number" min="1" value={item.quantity} onChange={e => setItem({...item, quantity: Number(e.target.value)})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>KL (kg)</Label>
                                    <Input type="number" value={item.weight} onChange={e => setItem({...item, weight: e.target.value})} required />
                                </div>
                                 <div className="space-y-2">
                                    <Label>Giá trị (VNĐ)</Label>
                                    <Input type="number" value={item.value} onChange={e => setItem({...item, value: e.target.value})} required placeholder="0" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Ghi chú</Label>
                                <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú cho tài xế..." />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50">
                        <CardContent className="pt-6">
                            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || isLoadingData}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Đang xử lý...</> : 
                                    (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') ? "Tiếp tục thanh toán »" : "Tạo đơn ngay"
                                }
                            </Button>
                        </CardContent>
                    </Card>
                </div>
              </form>
            </div>
        </main>
        <Footer/>
    </div>
  )
}