"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Plus, MoreHorizontal, Edit, Trash2, Container, DollarSign 
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

// Helper format tiền
const formatVND = (value: any) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [currentService, setCurrentService] = useState<any>(null)

  // Form Data
  const [formData, setFormData] = useState({
    ma_dich_vu: "",
    ten_dich_vu: "",
    mo_ta: "",
    loai_dich_vu: "NOI_TINH",
    don_vi_tinh: "kg",
    gia_co_ban: "",
    chinh_sach_gia: "",
    trang_thai: "HOAT_DONG"
  })

  // 1. Fetch Services
  const fetchServices = async () => {
    const token = localStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) setServices(await res.json())
    } catch (error) { console.error(error) }
  }

  useEffect(() => { fetchServices() }, [])

  // 2. Open Modal
  const openAddModal = () => {
    setCurrentService(null)
    setFormData({
      ma_dich_vu: "", ten_dich_vu: "", mo_ta: "", loai_dich_vu: "NOI_TINH",
      don_vi_tinh: "kg", gia_co_ban: "", chinh_sach_gia: "", trang_thai: "HOAT_DONG"
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: any) => {
    setCurrentService(item)
    setFormData({
      ma_dich_vu: item.ma_dich_vu,
      ten_dich_vu: item.ten_dich_vu,
      mo_ta: item.mo_ta || "",
      loai_dich_vu: item.loai_dich_vu,
      don_vi_tinh: item.don_vi_tinh,
      gia_co_ban: item.gia_co_ban,
      chinh_sach_gia: item.chinh_sach_gia || "",
      trang_thai: item.trang_thai
    })
    setIsModalOpen(true)
  }

  // 3. Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const token = localStorage.getItem("accessToken")
    const url = currentService 
      ? `${process.env.NEXT_PUBLIC_API_URL}/services/${currentService.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/services`
    const method = currentService ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        alert(currentService ? "Cập nhật thành công" : "Thêm mới thành công")
        setIsModalOpen(false)
        fetchServices()
      } else {
        const err = await res.json()
        alert(err.message || "Lỗi")
      }
    } catch (error) { console.error(error) } finally { setIsLoading(false) }
  }

  // 4. Delete
  const handleDelete = async () => {
    const token = localStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${currentService.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        alert("Đã xóa dịch vụ")
        setIsDeleteAlertOpen(false)
        fetchServices()
      }
    } catch (error) { console.error(error) }
  }

  // Render Badge
  const getStatusBadge = (status: string) => {
    return status === 'HOAT_DONG' 
      ? <Badge className="bg-emerald-600">Hoạt động</Badge> 
      : <Badge variant="destructive">Tạm dừng</Badge>
  }

  const filteredData = services.filter(s => 
    s.ten_dich_vu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ma_dich_vu.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Dịch vụ Vận chuyển</h1>
          <p className="text-sm text-muted-foreground">Thiết lập giá cước và các loại hình dịch vụ</p>
        </div>
        <Button onClick={openAddModal} className="gap-2 bg-primary">
            <Plus className="w-4 h-4"/> Thêm dịch vụ
        </Button>
      </div>

      {/* Cards thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl bg-card flex items-center gap-4">
             <div className="p-3 bg-blue-100 rounded-lg"><Container className="w-6 h-6 text-blue-600"/></div>
             <div><p className="text-sm text-muted-foreground">Tổng dịch vụ</p><h3 className="text-2xl font-bold">{services.length}</h3></div>
        </div>
        <div className="p-4 border rounded-xl bg-card flex items-center gap-4">
             <div className="p-3 bg-emerald-100 rounded-lg"><DollarSign className="w-6 h-6 text-emerald-600"/></div>
             <div><p className="text-sm text-muted-foreground">Đang hoạt động</p><h3 className="text-2xl font-bold">{services.filter(s=>s.trang_thai==='HOAT_DONG').length}</h3></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 max-w-sm">
           <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm tên, mã dịch vụ..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
        </div>

        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-xs uppercase border-b">
              <tr>
                <th className="px-6 py-4">Mã DV</th>
                <th className="px-6 py-4">Tên Dịch vụ</th>
                <th className="px-6 py-4">Loại hình</th>
                <th className="px-6 py-4">Giá cước</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-mono font-bold text-primary">{s.ma_dich_vu}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{s.ten_dich_vu}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-50">{s.mo_ta}</div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="outline">{s.loai_dich_vu}</Badge></td>
                  <td className="px-6 py-4 font-medium">
                    {formatVND(s.gia_co_ban)} / {s.don_vi_tinh}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(s.trang_thai)}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4"/></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditModal(s)}><Edit className="w-4 h-4 mr-2"/> Sửa thông tin</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => { setCurrentService(s); setIsDeleteAlertOpen(true) }}><Trash2 className="w-4 h-4 mr-2"/> Xóa dịch vụ</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
           <DialogHeader><DialogTitle>{currentService ? "Sửa Dịch vụ" : "Thêm Dịch vụ mới"}</DialogTitle></DialogHeader>
           <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Mã dịch vụ</Label>
                    <Input required placeholder="VD: DV-HL-01" value={formData.ma_dich_vu} onChange={e=>setFormData({...formData, ma_dich_vu: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label>Tên dịch vụ</Label>
                    <Input required placeholder="Hỏa tốc nội thành..." value={formData.ten_dich_vu} onChange={e=>setFormData({...formData, ten_dich_vu: e.target.value})} />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Loại hình</Label>
                    <Select value={formData.loai_dich_vu} onValueChange={(val)=>setFormData({...formData, loai_dich_vu: val})}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NOI_TINH">Nội tỉnh</SelectItem>
                            <SelectItem value="LIEN_TINH">Liên tỉnh</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <Select value={formData.trang_thai} onValueChange={(val)=>setFormData({...formData, trang_thai: val})}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="HOAT_DONG">Hoạt động</SelectItem>
                            <SelectItem value="TAM_DUNG">Tạm dừng</SelectItem>
                            <SelectItem value="NGUNG_CUNG_CAP">Ngừng cung cấp</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Giá cơ bản (VNĐ)</Label>
                    <Input type="number" required value={formData.gia_co_ban} onChange={e=>setFormData({...formData, gia_co_ban: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label>Đơn vị tính</Label>
                    <Input placeholder="kg, km, m3..." value={formData.don_vi_tinh} onChange={e=>setFormData({...formData, don_vi_tinh: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-2">
                  <Label>Mô tả dịch vụ</Label>
                  <Textarea value={formData.mo_ta} onChange={e=>setFormData({...formData, mo_ta: e.target.value})} />
              </div>
              <div className="space-y-2">
                  <Label>Chính sách giá (Ghi chú)</Label>
                  <Textarea placeholder="VD: Phụ thu 20% giờ cao điểm..." value={formData.chinh_sach_gia} onChange={e=>setFormData({...formData, chinh_sach_gia: e.target.value})} />
              </div>
              <DialogFooter>
                 <Button type="button" variant="outline" onClick={()=>setIsModalOpen(false)}>Hủy</Button>
                 <Button type="submit" disabled={isLoading}>{isLoading ? "Đang lưu..." : "Lưu thông tin"}</Button>
              </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>

      {/* ALERT DELETE */}
      <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
         <DialogContent>
            <DialogHeader><DialogTitle>Xóa dịch vụ?</DialogTitle></DialogHeader>
            <p>Bạn có chắc muốn xóa dịch vụ <strong>{currentService?.ten_dich_vu}</strong>?</p>
            <DialogFooter>
                <Button variant="outline" onClick={()=>setIsDeleteAlertOpen(false)}>Hủy</Button>
                <Button variant="destructive" onClick={handleDelete}>Xóa ngay</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </main>
  )
}