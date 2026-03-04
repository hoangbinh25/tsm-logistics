"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Search, Eye, MoreHorizontal, Truck, XCircle, Zap,
  Loader2
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
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/utils/api"

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
  const { logout } = useAuth()
  const { toast } = useToast()

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      const [resOrders, resDrivers, resVehicles] = await Promise.all([
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/orders`),
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/drivers/list?status=APPROVED`), // Lấy danh sách tài xế TỪ HỒ SƠ ĐÃ DUYỆT
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/fleet`)
      ])
      if (resOrders.ok) {
        const payload = await resOrders.json()

        // Kiểm tra xem backend trả về [] hay { data: [] }
        if (Array.isArray(payload)) {
          setOrders(payload)
        } else if (payload.data && Array.isArray(payload.data)) {
          setOrders(payload.data) // Lấy đúng mảng bên trong
        } else {
          setOrders([]) // Fallback nếu dữ liệu lạ
        }
      } else {
        setOrders([]) // Nếu lỗi mạng/401 thì set rỗng để không crash
      }

      // 2. XỬ LÝ TÀI XẾ (Tương tự)
      if (resDrivers.ok) {
        const payload = await resDrivers.json()
        if (Array.isArray(payload)) setDrivers(payload)
        else if (payload.data && Array.isArray(payload.data)) setDrivers(payload.data)
        else setDrivers([])
      }

      // 3. XỬ LÝ XE (Tương tự)
      if (resVehicles.ok) {
        const payload = await resVehicles.json()
        if (Array.isArray(payload)) setVehicles(payload)
        else if (payload.data && Array.isArray(payload.data)) setVehicles(payload.data)
        else setVehicles([])
      }
    } catch (error) { console.error("Lỗi tải dữ liệu", error) }
  }

  useEffect(() => { fetchData() }, [])

  // 2. Xử lý Phân công THỦ CÔNG
  const handleManualAssign = async () => {
    if (!assignData.tai_xe_id || !assignData.phuong_tien_id) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn đầy đủ Tài xế và Phương tiện.",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log("Dữ liệu gửi đi:", assignData);

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/orders/${selectedOrder.id}/assign`, {
        method: "POST",
        body: JSON.stringify(assignData)
      })

      // Đọc JSON an toàn 
      const data = await res.json().catch(() => null);

      if (res.ok) {
        toast({
          title: "Phân công thành công!",
          description: `Đơn hàng đã được giao cho tài xế.`,
          className: "bg-green-600 text-white border-none",
        })
        setIsAssignOpen(false)
        fetchData()
      } else {
        if (res.status === 401) {
          toast({ variant: "destructive", title: "Hết phiên đăng nhập", description: "Vui lòng đăng nhập lại." });
          if (logout) logout();
          return;
        }
        const errorMessage = data?.message || "Lỗi không xác định từ server";
        const errorDetail = data?.error ? (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) : "";

        toast({
          variant: "destructive",
          title: "Phân công thất bại",
          description: `${errorMessage} ${errorDetail}`,
        })
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 3. Xử lý Phân công TỰ ĐỘNG (Logic mới)
  const handleAutoAssign = async () => {
    setIsLoading(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/orders/${selectedOrder.id}/auto-assign`, {
        method: "POST",
      })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Phân công tự động thành công!",
          description: (
            <div className="mt-2 text-sm">
              <p>Tài xế: <strong>{data.driver}</strong></p>
              <p>Xe: <strong>{data.vehicle}</strong></p>
            </div>
          ),
          className: "bg-green-600 text-white border-none",
        })
        setIsAssignOpen(false)
        fetchData()
      } else {
        const errorMessage = data.message || "Có lỗi xảy ra";
        const errorDetail = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);

        toast({
          variant: "destructive",
          title: "Phân công thất bại",
          description: `${errorMessage} ${errorDetail ? `(${errorDetail})` : ''}`,
        })
      }
    } catch (error) { console.error(error) } finally { setIsLoading(false) }
  }

  // 4. Xử lý Hủy đơn
  const handleCancel = async () => {
    // Validate lý do
    if (!cancelReason.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập lý do hủy đơn hàng.",
      })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/orders/${selectedOrder.id}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ ly_do: cancelReason })
      })

      const data = await res.json() // Đọc response để lấy message lỗi nếu có

      if (res.ok) {
        toast({
          title: "Đã hủy đơn hàng",
          description: `Đơn ${selectedOrder.ma_don_hang} đã được hủy thành công.`,
          className: "bg-green-600 text-white border-none",
        })
        setIsCancelOpen(false)
        setCancelReason("")
        fetchData()
      } else {
        toast({
          variant: "destructive",
          title: "Hủy thất bại",
          description: data.message || "Có lỗi xảy ra khi hủy đơn.",
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Lỗi kết nối",
        description: "Vui lòng kiểm tra lại mạng hoặc server.",
      })
    } finally {
      setIsLoading(false)
    }
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

  // --- LOGIC LỌC PHƯƠNG TIỆN PHÙ HỢP BẰNG LÁI TÀI XẾ ---
  const isCompatible = (license: string, weight: number, vehicleType: string) => {
    if (!license) return false;
    const l = license.toUpperCase();

    // Kéo Rơ moóc, Đầu Kéo bắt buộc FC
    if (vehicleType?.toLowerCase().includes("đầu kéo") || weight >= 15000) {
      return l === "FC";
    }

    // Tải trọng >= 3.5 tấn
    if (weight >= 3500) {
      return ["C", "D", "E", "FC"].includes(l);
    }

    // Tải trọng < 3.5 tấn
    return ["B2", "C", "D", "E", "FC"].includes(l);
  }

  const getAvailableVehicles = () => {
    const available = vehicles.filter(v => v.trang_thai === 'SAN_SANG');
    if (!assignData.tai_xe_id) return available;

    const driver = drivers.find(d => d.id === assignData.tai_xe_id);
    if (!driver) return available;

    return available.filter(v => isCompatible(driver.hang_bang_lai, Number(v.tai_trong_toi_da), v.loai_phuong_tien));
  }
  const filteredVehicles = getAvailableVehicles();

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
                            {order.tai_xe.nguoi_dung ? (
                              <img src={order.tai_xe.nguoi_dung.anh_dai_dien} className="w-full h-full object-cover" />
                            ) : (
                              <Truck className="w-4 h-4 text-slate-500" />
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

                          {['TAO_MOI', 'CHO_XAC_NHAN', 'DA_PHAN_CONG'].includes(order.trang_thai_don_hang) && (
                            <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsAssignOpen(true) }}>
                              <Truck className="w-4 h-4 mr-2 text-blue-600" />
                              {order.trang_thai_don_hang === 'DA_PHAN_CONG' ? 'Điều phối lại' : 'Phân công xe'}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {['TAO_MOI', 'CHO_XAC_NHAN', 'DA_PHAN_CONG'].includes(order.trang_thai_don_hang) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => { setSelectedOrder(order); setIsCancelOpen(true) }}
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Hủy đơn hàng
                              </DropdownMenuItem>
                            </>
                          )}
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
                <Select onValueChange={(val) => setAssignData({ ...assignData, tai_xe_id: val })}>
                  <SelectTrigger><SelectValue placeholder="-- Chọn tài xế --" /></SelectTrigger>
                  <SelectContent>
                    {drivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nguoi_dung?.ho_ten || "Vô danh"} - Bằng {d.hang_bang_lai}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chọn Phương tiện</Label>
                <Select disabled={!assignData.tai_xe_id} onValueChange={(val) => setAssignData({ ...assignData, phuong_tien_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder={!assignData.tai_xe_id ? "Vui lòng chọn tài xế trước" : "-- Chọn xe (tương thích) --"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredVehicles.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500 text-center">Không có xe phù hợp hạng bằng lái này</div>
                    ) : (
                      filteredVehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.bien_kiem_soat} ({v.tai_trong_toi_da}kg) - {v.loai_phuong_tien}</SelectItem>
                      ))
                    )}
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
      {/* --- MODAL HỦY ĐƠN --- */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Xác nhận hủy đơn hàng
            </DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Đơn hàng <strong>{selectedOrder?.ma_don_hang}</strong> sẽ chuyển sang trạng thái ĐÃ HỦY.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label className="mb-2 block">Lý do hủy đơn <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Ví dụ: Khách boom hàng, sai địa chỉ..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCancelOpen(false)} disabled={isLoading}>
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</>
              ) : (
                "Xác nhận Hủy"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </main>
  )
}