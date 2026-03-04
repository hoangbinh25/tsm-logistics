"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Search, Plus, Truck, CheckCircle2, Trash2, Edit, Wrench, MapPin, Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // State cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<any>(null) // Nếu null là thêm mới, có data là sửa
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [newLocation, setNewLocation] = useState("")

  // Form Data
  const [formData, setFormData] = useState({
    bien_kiem_soat: "",
    loai_phuong_tien: "",
    hang_xe: "",
    model: "",
    nam_san_xuat: new Date().getFullYear(),
    tai_trong_toi_da: "",
    the_tich_thung: "",
    trang_thai: "SAN_SANG",
    ngay_dang_kiem: "",
    ngay_het_han_dang_kiem: "",
    so_km_da_di: 0,
    dinh_ky_bao_duong_km: 5000,
    ngay_bao_duong_cuoi: "",
    ghi_chu: ""
  })

  // 1. Fetch dữ liệu từ API
  const fetchVehicles = async () => {
    const token = sessionStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error("Lỗi tải danh sách xe:", error)
    }
  }

  const handleCheckMaintenance = async () => {
    const token = sessionStorage.getItem("accessToken")
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet/check-maintenance`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Kiểm tra xong! Có ${data.count} xe cần bảo dưỡng. Hệ thống đã gửi thông báo cho quản lý.`)
        fetchVehicles()
      } else {
        alert(data.message || "Lỗi kiểm tra")
      }
    } catch (error) {
      alert("Lỗi kết nối")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  // 2. Xử lý mở Modal
  const openAddModal = () => {
    setCurrentVehicle(null)
    setFormData({
      bien_kiem_soat: "", loai_phuong_tien: "", hang_xe: "", model: "",
      nam_san_xuat: new Date().getFullYear(), tai_trong_toi_da: "", the_tich_thung: "",
      trang_thai: "SAN_SANG", ngay_dang_kiem: "", ngay_het_han_dang_kiem: "",
      so_km_da_di: 0, dinh_ky_bao_duong_km: 5000, ngay_bao_duong_cuoi: "",
      ghi_chu: ""
    })
    setIsModalOpen(true)
  }

  const openEditModal = (vehicle: any) => {
    setCurrentVehicle(vehicle)
    // Format date string cho input type="date" (YYYY-MM-DD)
    const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : ""

    setFormData({
      bien_kiem_soat: vehicle.bien_kiem_soat,
      loai_phuong_tien: vehicle.loai_phuong_tien,
      hang_xe: vehicle.hang_xe,
      model: vehicle.model,
      nam_san_xuat: vehicle.nam_san_xuat,
      tai_trong_toi_da: vehicle.tai_trong_toi_da,
      the_tich_thung: vehicle.the_tich_thung,
      trang_thai: vehicle.trang_thai,
      ngay_dang_kiem: formatDate(vehicle.ngay_dang_kiem),
      ngay_het_han_dang_kiem: formatDate(vehicle.ngay_het_han_dang_kiem),
      so_km_da_di: vehicle.so_km_da_di || 0,
      dinh_ky_bao_duong_km: vehicle.dinh_ky_bao_duong_km || 5000,
      ngay_bao_duong_cuoi: formatDate(vehicle.ngay_bao_duong_cuoi),
      ghi_chu: vehicle.ghi_chu || ""
    })
    setIsModalOpen(true)
  }

  // 3. Xử lý Submit (Thêm hoặc Sửa)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const token = sessionStorage.getItem("accessToken")
    const url = currentVehicle
      ? `${process.env.NEXT_PUBLIC_API_URL}/fleet/${currentVehicle.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/fleet`
    const method = currentVehicle ? "PUT" : "POST"

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
        alert(currentVehicle ? "Cập nhật thành công!" : "Thêm xe mới thành công!")
        setIsModalOpen(false)
        fetchVehicles() // Load lại bảng
      } else {
        const err = await res.json()
        alert(err.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error(error)
      alert("Lỗi kết nối server")
    } finally {
      setIsLoading(false)
    }
  }

  // 4. Xử lý Xóa
  const handleMaintain = async (id: string) => {
    if (!confirm("Xác nhận đã bảo dưỡng xong cho phương tiện này?")) return
    const token = sessionStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet/${id}/maintain`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        alert("Xác nhận bảo dưỡng thành công")
        fetchVehicles()
      } else {
        alert("Có lỗi xảy ra")
      }
    } catch (error) {
      alert("Lỗi server")
    }
  }

  const handleUpdateLocation = async () => {
    if (!currentVehicle || !newLocation) return
    setIsLoading(true)
    const token = sessionStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet/${currentVehicle.id}/location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ location: newLocation })
      })
      if (res.ok) {
        alert("Cập nhật vị trí thành công!")
        setIsLocationModalOpen(false)
        fetchVehicles()
      } else {
        alert("Có lỗi xảy ra")
      }
    } catch (error) {
      alert("Lỗi kết nối")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentVehicle) return
    const token = sessionStorage.getItem("accessToken")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fleet/${currentVehicle.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        alert("Đã xóa phương tiện")
        setIsDeleteAlertOpen(false)
        fetchVehicles()
      } else {
        alert("Không thể xóa phương tiện này")
      }
    } catch (error) {
      alert("Lỗi server")
    }
  }

  // Helper render Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SAN_SANG": return <Badge className="bg-emerald-500">Sẵn sàng</Badge>
      case "DANG_VAN_CHUYEN": return <Badge className="bg-blue-500">Đang chạy</Badge>
      case "BAO_DUONG": return <Badge variant="secondary" className="text-amber-600 bg-amber-100">Bảo dưỡng</Badge>
      case "HU_HONG": return <Badge variant="destructive">Hư hỏng</Badge>
      default: return <Badge variant="outline">Ngừng HĐ</Badge>
    }
  }

  const checkDangKiem = (dateString: string) => {
    const today = new Date();
    const expiry = new Date(dateString);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: "Đã hết hạn", color: "text-red-600 font-bold" };
    if (diffDays < 30) return { text: `Còn ${diffDays} ngày`, color: "text-amber-600 font-medium" };
    return { text: new Date(dateString).toLocaleDateString('vi-VN'), color: "text-muted-foreground" };
  }

  // Filter local
  const filteredVehicles = vehicles.filter(v =>
    v.bien_kiem_soat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.hang_xe.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Đội xe</h1>
          <p className="text-muted-foreground text-sm">Quản lý {vehicles.length} phương tiện</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCheckMaintenance} variant="outline" className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50" disabled={isLoading}>
            <CheckCircle2 className="w-4 h-4" /> Kiểm tra bảo dưỡng
          </Button>
          <Button onClick={openAddModal} className="gap-2 bg-primary">
            <Plus className="w-4 h-4" /> Thêm xe mới
          </Button>
        </div>
      </div>

      {/* Stats Cards (Giữ nguyên hoặc dùng số thật từ vehicles) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-xl bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Truck className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-sm text-muted-foreground">Tổng số xe</p><h3 className="text-2xl font-bold">{vehicles.length}</h3></div>
        </div>
        <div className="p-4 border rounded-xl bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
          <div><p className="text-sm text-muted-foreground">Sẵn sàng</p><h3 className="text-2xl font-bold text-emerald-600">{vehicles.filter(v => v.trang_thai === 'SAN_SANG').length}</h3></div>
        </div>
        <div className="p-4 border rounded-xl bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-lg"><Wrench className="w-6 h-6 text-amber-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Cần bảo dưỡng</p>
            <h3 className="text-2xl font-bold text-amber-600">
              {vehicles.filter(v => v.so_km_da_di >= v.dinh_ky_bao_duong_km).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm biển số, hãng..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4">Biển số</th>
                <th className="px-6 py-4">Thông tin xe</th>
                <th className="px-6 py-4">Tải / Thùng</th>
                <th className="px-6 py-4">Bảo dưỡng (km)</th>
                <th className="px-6 py-4">Vị trí hiện tại</th>
                <th className="px-6 py-4">Hạn đăng kiểm</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVehicles.map((xe) => {
                const dk = checkDangKiem(xe.ngay_het_han_dang_kiem)
                return (
                  <tr key={xe.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-bold text-primary">{xe.bien_kiem_soat}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{xe.hang_xe} {xe.model}</span>
                        <span className="text-xs text-muted-foreground">{xe.nam_san_xuat} • {xe.loai_phuong_tien}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>Tải: <strong>{xe.tai_trong_toi_da}</strong> kg</div>
                      <div>Thùng: {xe.the_tich_thung} m³</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className={xe.so_km_da_di >= xe.dinh_ky_bao_duong_km ? "text-red-600 font-bold" : ""}>
                        {xe.so_km_da_di?.toLocaleString()} / {xe.dinh_ky_bao_duong_km?.toLocaleString()} km
                      </div>
                      {xe.so_km_da_di >= xe.dinh_ky_bao_duong_km && <Badge variant="destructive" className="mt-1 text-[10px]">Cần bảo dưỡng</Badge>}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span className="line-clamp-2 max-w-[150px]">{xe.vi_tri_hien_tai || "Chưa xác định"}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-xs ${dk.color}`}>{dk.text}</td>
                    <td className="px-6 py-4">{getStatusBadge(xe.trang_thai)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {xe.so_km_da_di >= xe.dinh_ky_bao_duong_km && (
                          <Button variant="ghost" size="icon" title="Xác nhận bảo dưỡng" onClick={() => handleMaintain(xe.id)}>
                            <Wrench className="w-4 h-4 text-amber-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Cập nhật vị trí" onClick={() => { setCurrentVehicle(xe); setNewLocation(xe.vi_tri_hien_tai || ""); setIsLocationModalOpen(true) }}>
                          <MapPin className="w-4 h-4 text-orange-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(xe)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setCurrentVehicle(xe); setIsDeleteAlertOpen(true) }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL THÊM / SỬA XE --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentVehicle ? "Cập nhật phương tiện" : "Thêm phương tiện mới"}</DialogTitle>
            <DialogDescription>Điền đầy đủ thông tin phương tiện vào form dưới đây</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Biển kiểm soát</Label>
                <Input required placeholder="VD: 29C-123.45" value={formData.bien_kiem_soat} onChange={e => setFormData({ ...formData, bien_kiem_soat: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Loại xe</Label>
                <Input placeholder="VD: Xe tải thùng" value={formData.loai_phuong_tien} onChange={e => setFormData({ ...formData, loai_phuong_tien: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Hãng xe</Label>
                <Input placeholder="Hino" value={formData.hang_xe} onChange={e => setFormData({ ...formData, hang_xe: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input placeholder="XZU720" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Năm SX</Label>
                <Input type="number" value={formData.nam_san_xuat} onChange={e => setFormData({ ...formData, nam_san_xuat: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tải trọng (kg)</Label>
                <Input type="number" step="0.1" value={formData.tai_trong_toi_da} onChange={e => setFormData({ ...formData, tai_trong_toi_da: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Thể tích thùng (m³)</Label>
                <Input type="number" step="0.1" value={formData.the_tich_thung} onChange={e => setFormData({ ...formData, the_tich_thung: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Số KM đã đi</Label>
                <Input type="number" value={formData.so_km_da_di} onChange={e => setFormData({ ...formData, so_km_da_di: parseInt(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Định kỳ bảo dưỡng (km)</Label>
                <Input type="number" value={formData.dinh_ky_bao_duong_km} onChange={e => setFormData({ ...formData, dinh_ky_bao_duong_km: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bảo dưỡng cuối</Label>
                <Input type="date" value={formData.ngay_bao_duong_cuoi} onChange={e => setFormData({ ...formData, ngay_bao_duong_cuoi: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Input value={formData.ghi_chu || ""} onChange={e => setFormData({ ...formData, ghi_chu: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày đăng kiểm</Label>
                <Input type="date" value={formData.ngay_dang_kiem} onChange={e => setFormData({ ...formData, ngay_dang_kiem: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Hết hạn đăng kiểm</Label>
                <Input type="date" required value={formData.ngay_het_han_dang_kiem} onChange={e => setFormData({ ...formData, ngay_het_han_dang_kiem: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={formData.trang_thai} onValueChange={(val) => setFormData({ ...formData, trang_thai: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAN_SANG">Sẵn sàng</SelectItem>
                  <SelectItem value="DANG_VAN_CHUYEN">Đang vận chuyển</SelectItem>
                  <SelectItem value="BAO_DUONG">Bảo dưỡng</SelectItem>
                  <SelectItem value="HU_HONG">Hư hỏng</SelectItem>
                  <SelectItem value="NGUNG_HOAT_DONG">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Đang lưu..." : "Lưu thông tin"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- ALERT XÓA --- */}
      <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa xe?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa xe biển số <strong>{currentVehicle?.bien_kiem_soat}</strong> không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAlertOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa ngay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL CẬP NHẬT VỊ TRÍ (MÔ PHỎNG) --- */}
      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mô phỏng vị trí xe</DialogTitle>
            <DialogDescription>Cập nhật vị trí hiện tại của xe {currentVehicle?.bien_kiem_soat}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Vị trí hiện tại</Label>
              <Input placeholder="VD: Kho chính, Đang tại Cầu Giấy..." value={newLocation} onChange={e => setNewLocation(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => setNewLocation("Tại kho chính (Hà Nội)")}>Tại kho chính</Button>
              <Button variant="outline" size="sm" onClick={() => setNewLocation("Đang di chuyển giao hàng")}>Đang di chuyển</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLocationModalOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdateLocation} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Cập nhật ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}