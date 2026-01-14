"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, Eye, MoreHorizontal, Truck, XCircle, AlertCircle, CheckCircle2, Zap 
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Helper format tiền
const formatCurrency = (amount: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount))

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false) // Loading chung cho các hành động
  
  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)

  // Data Actions
  const [assignData, setAssignData] = useState({ tai_xe_id: "", phuong_tien_id: "" })
  const [cancelReason, setCancelReason] = useState("")

  // 1. Fetch Data
  const fetchData = async () => {
    const token = localStorage.getItem("accessToken")
    const headers = { "Authorization": `Bearer ${token}` }
    try {
      const [resOrders, resDrivers, resVehicles] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?role=TAI_XE`, { headers }), // API lấy list tài xế
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet`, { headers })
      ])
      if (resOrders.ok) setOrders(await resOrders.json())
      if (resDrivers.ok) setDrivers(await resDrivers.json())
      if (resVehicles.ok) setVehicles(await resVehicles.json())
    } catch (error) { console.error("Lỗi tải dữ liệu", error) }
  }

  useEffect(() => { fetchData() }, [])

  // 2. Xử lý Phân công THỦ CÔNG
  const handleManualAssign = async () => {
    if(!assignData.tai_xe_id || !assignData.phuong_tien_id) return alert("Vui lòng chọn đủ Tài xế và Xe!")
    setIsLoading(true)
    const token = localStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${selectedOrder.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(assignData)
      })
      if (res.ok) {
        alert("Phân công thành công!")
        setIsAssignOpen(false)
        fetchData()
      } else {
        alert("Lỗi phân công")
      }
    } catch (error) { console.error(error) } finally { setIsLoading(false) }
  }

  // 3. Xử lý Phân công TỰ ĐỘNG (Logic mới)
  const handleAutoAssign = async () => {
    setIsLoading(true)
    const token = localStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${selectedOrder.id}/auto-assign`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (res.ok) {
        // Thông báo kết quả tìm được
        alert(`🎉 Thành công! Đã gán:\n- Tài xế: ${data.driver}\n- Xe: ${data.vehicle}`)
        setIsAssignOpen(false)
        fetchData()
      } else {
        alert(`⚠️ Không tìm được: ${data.message}`)
      }
    } catch (error) { console.error(error) } finally { setIsLoading(false) }
  }

  // 4. Xử lý Hủy đơn
  const handleCancel = async () => {
    const token = localStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${selectedOrder.id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ly_do: cancelReason })
      })
      if (res.ok) {
        alert("Đã hủy đơn hàng")
        setIsCancelOpen(false)
        fetchData()
      }
    } catch (error) { console.error(error) }
  }

  // Helper render UI
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TAO_MOI": return <Badge variant="outline" className="text-blue-600 border-blue-600">Mới tạo</Badge>
      case "DA_PHAN_CONG": return <Badge className="bg-purple-600">Đã phân công</Badge>
      case "DANG_VAN_CHUYEN": return <Badge className="bg-blue-600 animate-pulse">Đang giao</Badge>
      case "DA_GIAO": return <Badge className="bg-emerald-600">Hoàn thành</Badge>
      case "DA_HUY": return <Badge variant="destructive">Đã hủy</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredOrders = orders.filter(o => 
    o.ma_don_hang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.khach_hang?.ho_ten.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Điều phối Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">Quản lý và phân công vận chuyển</p>
        </div>
        <Button>Xuất Excel</Button>
      </div>

      <Tabs defaultValue="ALL" className="w-full">
        <TabsList>
          <TabsTrigger value="ALL">Tất cả</TabsTrigger>
          <TabsTrigger value="NEW">Mới / Chờ xử lý</TabsTrigger>
          <TabsTrigger value="DELIVERING">Đang giao</TabsTrigger>
          <TabsTrigger value="DONE">Lịch sử</TabsTrigger>
        </TabsList>
        
        <div className="my-4 flex items-center gap-4">
           <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm mã đơn, khách hàng..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
        </div>

        <TabsContent value="ALL" className="mt-0">
  <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
    <table className="w-full text-sm text-left">
      <thead className="bg-muted/50 text-xs uppercase border-b">
        <tr>
          <th className="px-6 py-4">Mã Đơn</th>
          <th className="px-6 py-4">Khách hàng</th>
          <th className="px-6 py-4">Lộ trình</th>
          {/* 1. THÊM CỘT TÀI XẾ */}
          <th className="px-6 py-4">Tài xế</th> 
          <th className="px-6 py-4">Tổng tiền</th>
          <th className="px-6 py-4">Trạng thái</th>
          <th className="px-6 py-4 text-right">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {filteredOrders.map((order) => (
          <tr key={order.id} className="hover:bg-muted/30">
            {/* Mã đơn */}
            <td className="px-6 py-4 font-bold text-primary">{order.ma_don_hang}</td>
            
            {/* Khách hàng */}
            <td className="px-6 py-4">
                <div className="font-medium">{order.khach_hang?.ho_ten}</div>
                <div className="text-xs text-muted-foreground">{order.khach_hang?.so_dien_thoai}</div>
            </td>
            
            {/* Lộ trình */}
            <td className="px-6 py-4 max-w-50">
                <div className="text-xs font-medium">{order.kho_gui?.ten_kho || "Kho trung tâm"}</div>
                <div className="text-xs text-muted-foreground truncate" title={order.dia_chi_nhan}>→ {order.dia_chi_nhan}</div>
            </td>

            {/* 2. HIỂN THỊ TÀI XẾ */}
            <td className="px-6 py-4">
                {order.tai_xe ? (
                    <div className="flex items-center gap-2">
                        {/* Avatar nhỏ (nếu có) */}
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                             {order.tai_xe.nguoi_dung?.anh_dai_dien ? (
                                <img src={order.tai_xe.nguoi_dung.anh_dai_dien} className="w-full h-full object-cover"/>
                             ) : (
                                <Truck className="w-4 h-4 text-slate-500"/>
                             )}
                        </div>
                        <div>
                            <div className="font-medium text-blue-700">{order.tai_xe.nguoi_dung?.ho_ten}</div>
                            <div className="text-xs text-muted-foreground">{order.tai_xe.nguoi_dung?.so_dien_thoai}</div>
                        </div>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground italic px-2 py-1 bg-slate-100 rounded-md">
                        Chưa phân công
                    </span>
                )}
            </td>

            {/* Tổng tiền */}
            <td className="px-6 py-4 font-medium">{formatCurrency(order.tong_thanh_toan)}</td>
            
            {/* Trạng thái */}
            <td className="px-6 py-4">{getStatusBadge(order.trang_thai_don_hang)}</td>
            
            {/* Thao tác */}
            <td className="px-6 py-4 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* ... Menu items cũ ... */}
                  <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsDetailOpen(true) }}>
                    <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
                  </DropdownMenuItem>
                  
                  {['TAO_MOI', 'CHO_XAC_NHAN'].includes(order.trang_thai_don_hang) && (
                      <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsAssignOpen(true) }}>
                        <Truck className="w-4 h-4 mr-2 text-blue-600" /> Phân công xe
                      </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedOrder(order); setIsCancelOpen(true) }}>
                      <XCircle className="w-4 h-4 mr-2" /> Hủy đơn hàng
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</TabsContent>
      </Tabs>

      {/* --- MODAL PHÂN CÔNG (Có Auto) --- */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
         <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Phân công vận chuyển</DialogTitle>
                <DialogDescription>Đơn hàng: <strong>{selectedOrder?.ma_don_hang}</strong> ({selectedOrder?.kho_gui?.tinh_thanh})</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
                {/* NÚT AUTO ASSIGN */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                        <Zap className="w-5 h-5 fill-blue-500 text-blue-600" />
                        Gợi ý thông minh
                    </div>
                    <p className="text-xs text-blue-600/80">Hệ thống sẽ tự tìm Tài xế cùng khu vực và Xe đủ tải trọng đang rảnh.</p>
                    <Button 
                        onClick={handleAutoAssign} 
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-1"
                    >
                        {isLoading ? "Đang quét hệ thống..." : "⚡ Phân công tự động ngay"}
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Hoặc chọn thủ công</span></div>
                </div>

                {/* FORM THỦ CÔNG */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Chọn Tài xế</Label>
                        <Select onValueChange={(val) => setAssignData({...assignData, tai_xe_id: val})}>
                            <SelectTrigger><SelectValue placeholder="-- Chọn tài xế --" /></SelectTrigger>
                            <SelectContent>
                                {drivers.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.ho_ten} - {d.dia_chi || "Chưa có ĐC"}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Chọn Phương tiện</Label>
                        <Select onValueChange={(val) => setAssignData({...assignData, phuong_tien_id: val})}>
                            <SelectTrigger><SelectValue placeholder="-- Chọn xe --" /></SelectTrigger>
                            <SelectContent>
                                {vehicles.filter(v => v.trang_thai === 'SAN_SANG').map(v => (
                                    <SelectItem key={v.id} value={v.id}>{v.bien_kiem_soat} ({v.tai_trong_toi_da}kg)</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Hủy</Button>
                <Button onClick={handleManualAssign} disabled={isLoading}>Lưu thủ công</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </main>
  )
}