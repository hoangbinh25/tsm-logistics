"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, Filter, Eye, MoreHorizontal, Package, MapPin, Truck, CheckCircle, XCircle, AlertCircle 
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
  const [drivers, setDrivers] = useState<any[]>([])     // List tài xế để chọn
  const [vehicles, setVehicles] = useState<any[]>([])   // List xe để chọn
  const [searchTerm, setSearchTerm] = useState("")
  
  // States Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false) // Modal phân công
  const [isCancelOpen, setIsCancelOpen] = useState(false) // Modal hủy

  // Form Data cho Phân công
  const [assignData, setAssignData] = useState({ tai_xe_id: "", phuong_tien_id: "" })
  const [cancelReason, setCancelReason] = useState("")

  // 1. Fetch Dữ liệu (Đơn hàng, Tài xế, Xe)
  const fetchData = async () => {
    const token = localStorage.getItem("accessToken")
    const headers = { "Authorization": `Bearer ${token}` }
    
    try {
      // Gọi song song 3 API để tiết kiệm thời gian
      const [resOrders, resDrivers, resVehicles] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?role=TAI_XE`, { headers }), // Giả sử có API lấy list tài xế
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet`, { headers })
      ])

      if (resOrders.ok) setOrders(await resOrders.json())
      if (resDrivers.ok) setDrivers(await resDrivers.json())
      if (resVehicles.ok) setVehicles(await resVehicles.json())

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. Xử lý Phân công (Dispatch)
  const handleAssign = async () => {
    if(!assignData.tai_xe_id || !assignData.phuong_tien_id) return alert("Vui lòng chọn đủ Tài xế và Xe!")

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
        fetchData() // Reload
      } else {
        alert("Lỗi phân công")
      }
    } catch (error) { console.error(error) }
  }

  // 3. Xử lý Hủy đơn
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

  // Render Badge
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

  // Filter
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
          <TabsTrigger value="NEW">Chờ xử lý</TabsTrigger>
          <TabsTrigger value="DELIVERING">Đang giao</TabsTrigger>
          <TabsTrigger value="DONE">Hoàn thành</TabsTrigger>
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
                  <th className="px-6 py-4">Giá trị</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-bold text-primary">{order.ma_don_hang}</td>
                    <td className="px-6 py-4">
                        <div className="font-medium">{order.khach_hang?.ho_ten}</div>
                        <div className="text-xs text-muted-foreground">{order.khach_hang?.so_dien_thoai}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                        <div className="text-xs">Gửi: {order.kho_gui?.ten_kho || "Kho trung tâm"}</div>
                        <div className="text-xs truncate" title={order.dia_chi_nhan}>Nhận: {order.dia_chi_nhan}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.tong_thanh_toan)}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.trang_thai_don_hang)}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Xử lý đơn</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsDetailOpen(true) }}>
                            <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
                          </DropdownMenuItem>
                          
                          {/* Chỉ hiện nút Phân công khi đơn Mới hoặc Chờ xác nhận */}
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

      {/* --- MODAL XEM CHI TIẾT --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Chi tiết đơn: {selectedOrder?.ma_don_hang}</DialogTitle></DialogHeader>
          {selectedOrder && (
             <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 border rounded bg-muted/20">
                        <strong className="block mb-2 text-muted-foreground">THÔNG TIN GỬI</strong>
                        <p>Người gửi: {selectedOrder.khach_hang?.ho_ten}</p>
                        <p>SĐT: {selectedOrder.khach_hang?.so_dien_thoai}</p>
                    </div>
                    <div className="p-3 border rounded bg-muted/20">
                        <strong className="block mb-2 text-muted-foreground">THÔNG TIN NHẬN</strong>
                        <p>Địa chỉ: {selectedOrder.dia_chi_nhan}</p>
                        <p>SĐT người nhận: {selectedOrder.so_dien_thoai_nhan || "---"}</p>
                    </div>
                </div>
                {/* Bảng hàng hóa (Mockup hiển thị) */}
                <div className="border rounded">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50"><tr><th className="p-2 text-left">Hàng hóa</th><th className="p-2 text-right">Giá trị</th></tr></thead>
                        <tbody>
                            <tr><td className="p-2">Chi tiết hàng hóa...</td><td className="p-2 text-right">{formatCurrency(selectedOrder.tong_tien_hang)}</td></tr>
                        </tbody>
                    </table>
                </div>
             </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- MODAL PHÂN CÔNG (DISPATCH) --- */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Phân công vận chuyển</DialogTitle>
                <DialogDescription>Chọn Tài xế và Xe để giao đơn <strong>{selectedOrder?.ma_don_hang}</strong></DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label>Chọn Tài xế</Label>
                    <Select onValueChange={(val) => setAssignData({...assignData, tai_xe_id: val})}>
                        <SelectTrigger><SelectValue placeholder="-- Chọn tài xế --" /></SelectTrigger>
                        <SelectContent>
                            {drivers.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.ho_ten} - {d.so_dien_thoai}</SelectItem>
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
                                <SelectItem key={v.id} value={v.id}>{v.bien_kiem_soat} ({v.loai_phuong_tien})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Hủy</Button>
                <Button onClick={handleAssign}>Xác nhận phân công</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* --- MODAL HỦY ĐƠN --- */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
         <DialogContent>
            <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2"><AlertCircle/> Hủy đơn hàng</DialogTitle>
                <DialogDescription>Hành động này sẽ hủy đơn <strong>{selectedOrder?.ma_don_hang}</strong>. Vui lòng nhập lý do.</DialogDescription>
            </DialogHeader>
            <div className="py-2">
                <Textarea placeholder="Nhập lý do hủy (VD: Khách bom hàng, Hàng hỏng...)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCancelOpen(false)}>Quay lại</Button>
                <Button variant="destructive" onClick={handleCancel}>Xác nhận hủy</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

    </main>
  )
}