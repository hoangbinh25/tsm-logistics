"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, Plus, MapPin, Package, Edit, Trash2 
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [currentWarehouse, setCurrentWarehouse] = useState<any>(null)

  // Form Data
  const [formData, setFormData] = useState({
    ma_kho: "",
    ten_kho: "",
    dia_chi: "",
    tinh_thanh: "Hà Nội", // Giá trị mặc định
    quan_huyen: "",
    phuong_xa: "",
    loai_kho: "KHO_CHINH",
    suc_chua_toi_da: "",
    trang_thai: "HOAT_DONG",
    ghi_chu: ""
  })

  // 1. Fetch dữ liệu
  const fetchWarehouses = async () => {
    const token = localStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setWarehouses(data)
      }
    } catch (error) {
      console.error("Lỗi tải danh sách kho:", error)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  // 2. Mở Modal Thêm mới
  const openAddModal = () => {
    setCurrentWarehouse(null)
    setFormData({
      ma_kho: "", ten_kho: "", dia_chi: "", tinh_thanh: "", quan_huyen: "", phuong_xa: "",
      loai_kho: "KHO_CHINH", suc_chua_toi_da: "", trang_thai: "HOAT_DONG", ghi_chu: ""
    })
    setIsModalOpen(true)
  }

  // 3. Mở Modal Sửa
  const openEditModal = (wh: any) => {
    setCurrentWarehouse(wh)
    setFormData({
      ma_kho: wh.ma_kho,
      ten_kho: wh.ten_kho,
      dia_chi: wh.dia_chi,
      tinh_thanh: wh.tinh_thanh,
      quan_huyen: wh.quan_huyen,
      phuong_xa: wh.phuong_xa,
      loai_kho: wh.loai_kho,
      suc_chua_toi_da: wh.suc_chua_toi_da,
      trang_thai: wh.trang_thai,
      ghi_chu: wh.ghi_chu || ""
    })
    setIsModalOpen(true)
  }

  // 4. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const token = localStorage.getItem("accessToken")
    
    // URL & Method tùy thuộc vào đang thêm hay sửa
    const url = currentWarehouse 
      ? `${process.env.NEXT_PUBLIC_API_URL}/warehouses/${currentWarehouse.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/warehouses`
    const method = currentWarehouse ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        alert(currentWarehouse ? "Cập nhật thành công!" : "Thêm kho mới thành công!")
        setIsModalOpen(false)
        fetchWarehouses()
      } else {
        const err = await res.json()
        alert(err.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      alert("Lỗi kết nối server")
    } finally {
      setIsLoading(false)
    }
  }

  // 5. Xóa Kho
  const handleDelete = async () => {
    if (!currentWarehouse) return
    const token = localStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses/${currentWarehouse.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert("Đã xóa kho hàng")
        setIsDeleteAlertOpen(false)
        fetchWarehouses()
      } else {
        alert(data.message || "Không thể xóa kho này")
      }
    } catch (error) {
      alert("Lỗi server")
    }
  }

  // Local Filter
  const filteredWarehouses = warehouses.filter(wh => 
    wh.ten_kho.toLowerCase().includes(searchTerm.toLowerCase()) || 
    wh.ma_kho.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý kho bãi</h1>
          <p className="text-sm text-muted-foreground">Giám sát trạng thái và dung lượng của {warehouses.length} kho hàng</p>
        </div>
        <Button onClick={openAddModal} className="gap-2 bg-primary">
             <Plus className="w-4 h-4"/> Thêm kho mới
        </Button>
      </div>

      {/* Stats Cards (Tính toán từ dữ liệu thật) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="p-4 border rounded-xl bg-card shadow-sm flex flex-col justify-between">
            <div className="flex justify-between">
              <div><p className="text-sm text-muted-foreground">Tổng số kho</p><h3 className="text-2xl font-bold">{warehouses.length}</h3></div>
              <div className="p-2 bg-primary/10 rounded-lg"><MapPin className="w-5 h-5 text-primary" /></div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <span className="text-emerald-600 font-medium">{warehouses.filter(w => w.loai_kho === 'KHO_CHINH').length} kho chính</span>
            </div>
         </div>
         <div className="p-4 border rounded-xl bg-card shadow-sm flex flex-col justify-between">
            <div className="flex justify-between">
              <div><p className="text-sm text-muted-foreground">Đang hoạt động</p><h3 className="text-2xl font-bold text-emerald-600">{warehouses.filter(w => w.trang_thai === 'HOAT_DONG').length}</h3></div>
              <div className="p-2 bg-emerald-100 rounded-lg"><Package className="w-5 h-5 text-emerald-600" /></div>
            </div>
         </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 max-w-sm">
           <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm tên kho, mã kho..." className="pl-9" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
           </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Mã Kho</th>
                <th className="px-6 py-4 font-medium">Thông tin & Địa chỉ</th>
                <th className="px-6 py-4 font-medium">Loại & Trạng thái</th>
                <th className="px-6 py-4 font-medium">Sức chứa (m²)</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((wh) => (
                  <tr key={wh.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-primary">{wh.ma_kho}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-foreground">{wh.ten_kho}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {wh.dia_chi}, {wh.quan_huyen}, {wh.tinh_thanh}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                          {wh.loai_kho.replace('KHO_', '')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          wh.trang_thai === 'HOAT_DONG' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {wh.trang_thai}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{wh.suc_chua_toi_da}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(wh)}>
                              <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setCurrentWarehouse(wh); setIsDeleteAlertOpen(true) }}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Không tìm thấy kho nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentWarehouse ? "Cập nhật kho hàng" : "Thêm kho hàng mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Mã Kho (Duy nhất)</Label>
                    <Input required placeholder="VD: KHO-HN01" value={formData.ma_kho} onChange={e => setFormData({...formData, ma_kho: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Tên Kho</Label>
                    <Input required placeholder="Kho Trung tâm..." value={formData.ten_kho} onChange={e => setFormData({...formData, ten_kho: e.target.value})} />
                </div>
             </div>
             
             <div className="space-y-2">
                <Label>Địa chỉ chi tiết</Label>
                <Input required placeholder="Số nhà, đường..." value={formData.dia_chi} onChange={e => setFormData({...formData, dia_chi: e.target.value})} />
             </div>

             <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Tỉnh / Thành</Label>
                    <Input required value={formData.tinh_thanh} onChange={e => setFormData({...formData, tinh_thanh: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Quận / Huyện</Label>
                    <Input required value={formData.quan_huyen} onChange={e => setFormData({...formData, quan_huyen: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Phường / Xã</Label>
                    <Input required value={formData.phuong_xa} onChange={e => setFormData({...formData, phuong_xa: e.target.value})} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Loại Kho</Label>
                    <Select value={formData.loai_kho} onValueChange={(val) => setFormData({...formData, loai_kho: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="KHO_CHINH">Kho Chính</SelectItem>
                            <SelectItem value="KHO_TRUNG_CHUYEN">Kho Trung Chuyển</SelectItem>
                            <SelectItem value="KHO_LUU_TRU">Kho Lưu Trữ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Trạng Thái</Label>
                    <Select value={formData.trang_thai} onValueChange={(val) => setFormData({...formData, trang_thai: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="HOAT_DONG">Hoạt động</SelectItem>
                            <SelectItem value="TAM_DUNG">Tạm dừng</SelectItem>
                            <SelectItem value="DONG_CUA">Đóng cửa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
             </div>

             <div className="space-y-2">
                 <Label>Sức chứa tối đa (m² hoặc tấn)</Label>
                 <Input type="number" value={formData.suc_chua_toi_da} onChange={e => setFormData({...formData, suc_chua_toi_da: e.target.value})} />
             </div>

             <div className="space-y-2">
                 <Label>Ghi chú</Label>
                 <Textarea value={formData.ghi_chu} onChange={e => setFormData({...formData, ghi_chu: e.target.value})} />
             </div>

             <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Đang lưu..." : "Lưu thông tin"}</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ALERT XÓA */}
      <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Xác nhận xóa kho?</DialogTitle>
                <DialogDescription>
                    Bạn có chắc chắn muốn xóa kho <strong>{currentWarehouse?.ten_kho}</strong> không? 
                    <br/><span className="text-red-500 text-xs">Lưu ý: Không thể xóa kho nếu đang có đơn hàng liên kết.</span>
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteAlertOpen(false)}>Hủy</Button>
                <Button variant="destructive" onClick={handleDelete}>Xóa ngay</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </main>
  )
}