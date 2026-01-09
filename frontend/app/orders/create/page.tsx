"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function CreateOrderPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // State quản lý form
  const [receiver, setReceiver] = useState({ name: "", phone: "", address: "" })
  const [item, setItem] = useState({ name: "", weight: "", quantity: 1, value: "" })
  const [serviceId, setServiceId] = useState("") 
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [note, setNote] = useState("")

  // Giả lập danh sách kho và dịch vụ (Cần fetch từ API thật)
  const warehouses = [
    { id: "kho01", name: "Kho Hà Nội - Cầu Giấy" },
    { id: "kho02", name: "Kho TP.HCM - Tân Bình" }
  ]
  const [warehouseId, setWarehouseId] = useState(warehouses[0].id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("accessToken")
    
    // Payload gửi lên backend
    const payload = {
        senderInfo: {
            address: user?.dia_chi || "Địa chỉ mặc định user"
        },
        receiverInfo: receiver,
        warehouseId: warehouseId,
        serviceId: "dv_chuan", // Giả sử ID dịch vụ, bạn cần dropdown chọn dịch vụ thật
        paymentMethod: paymentMethod,
        note: note,
        items: [
            {
                ten_hang: item.name,
                mo_ta: "Hàng hóa thông thường",
                so_luong: item.quantity,
                don_vi: "Cái",
                khoi_luong: item.weight,
                don_gia: item.value
            }
        ]
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })

        if(res.ok) {
            alert("Tạo đơn hàng thành công!")
            router.push("/orders") // Chuyển hướng về trang danh sách đơn
        } else {
            const err = await res.json()
            alert(err.message || "Lỗi khi tạo đơn")
        }
    } catch (error) {
        console.error(error)
        alert("Lỗi kết nối server")
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Tạo vận đơn mới</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Cột Trái: Thông tin Người nhận & Kho */}
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>1. Điểm gửi & Nhận</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Chọn kho gửi hàng gần bạn</Label>
                        <Select value={warehouseId} onValueChange={setWarehouseId}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border-t pt-4">
                        <Label className="text-base font-semibold">Người nhận</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <Input placeholder="Họ tên người nhận" value={receiver.name} onChange={e => setReceiver({...receiver, name: e.target.value})} required />
                            <Input placeholder="Số điện thoại" value={receiver.phone} onChange={e => setReceiver({...receiver, phone: e.target.value})} required />
                        </div>
                        <Input className="mt-4" placeholder="Địa chỉ chi tiết (Số nhà, đường, xã/phường...)" value={receiver.address} onChange={e => setReceiver({...receiver, address: e.target.value})} required />
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader><CardTitle>2. Hình thức thanh toán</CardTitle></CardHeader>
                 <CardContent>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TIEN_MAT">Người gửi trả tiền mặt</SelectItem>
                            <SelectItem value="COD">Thu hộ (COD)</SelectItem>
                            <SelectItem value="CHUYEN_KHOAN">Chuyển khoản ngân hàng</SelectItem>
                        </SelectContent>
                    </Select>
                 </CardContent>
            </Card>
        </div>

        {/* Cột Phải: Thông tin Hàng hóa */}
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>3. Thông tin hàng hóa</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tên hàng hóa</Label>
                        <Input placeholder="Ví dụ: Quần áo, Sách vở..." value={item.name} onChange={e => setItem({...item, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                         <div className="space-y-2">
                            <Label>SL</Label>
                            <Input type="number" min="1" value={item.quantity} onChange={e => setItem({...item, quantity: parseInt(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <Label>KL (kg)</Label>
                            <Input type="number" step="0.1" value={item.weight} onChange={e => setItem({...item, weight: e.target.value})} required />
                        </div>
                         <div className="space-y-2">
                            <Label>Giá trị (VNĐ)</Label>
                            <Input type="number" placeholder="Khai giá" value={item.value} onChange={e => setItem({...item, value: e.target.value})} required />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Ghi chú cho tài xế/kho</Label>
                        <Textarea placeholder="Hàng dễ vỡ, giao giờ hành chính..." value={note} onChange={e => setNote(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            {/* Tổng kết sơ bộ */}
            <Card className="bg-slate-50">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Phí vận chuyển (tạm tính):</span>
                        <span className="text-primary">30.000 đ</span>
                    </div>
                    <Button type="submit" size="lg" className="w-full mt-4">Tạo đơn ngay</Button>
                </CardContent>
            </Card>
        </div>

      </form>
    </div>
  )
}