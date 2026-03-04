"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search, Plus, MapPin, Package, Edit, Trash2
} from "lucide-react"
import { useState } from "react"
import { useWarehouses, useWarehouseMutations } from "@/hooks/use-warehouses"
import { Warehouse } from "@/types/warehouse"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AddressSelector } from "@/components/address-selector"
import { StatsCard } from "@/components/stats-card"
import { useToast } from "@/hooks/use-toast"

export default function WarehousePage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")

  // Data logic với custom hooks
  const { data: warehouses = [], isLoading: isFetching } = useWarehouses()
  const { createMutation, updateMutation, deleteMutation } = useWarehouseMutations()

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse | null>(null)

  // Form Data
  const [formData, setFormData] = useState({
    ma_kho: "",
    ten_kho: "",
    dia_chi: "",
    tinh_thanh: "",
    quan_huyen: "",
    phuong_xa: "",
    loai_kho: "KHO_CHINH",
    suc_chua_toi_da: "",
    trang_thai: "HOAT_DONG",
    ghi_chu: ""
  })

  // Trạng thái loading chung cho các action
  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

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
  const openEditModal = (wh: Warehouse) => {
    setCurrentWarehouse(wh)
    setFormData({
      ma_kho: wh.ma_kho,
      ten_kho: wh.ten_kho,
      dia_chi: wh.dia_chi,
      tinh_thanh: wh.tinh_thanh,
      quan_huyen: wh.quan_huyen,
      phuong_xa: wh.phuong_xa,
      loai_kho: wh.loai_kho,
      suc_chua_toi_da: wh.suc_chua_toi_da.toString(),
      trang_thai: wh.trang_thai,
      ghi_chu: wh.ghi_chu || ""
    })
    setIsModalOpen(true)
  }

  // 4. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentWarehouse) {
      updateMutation.mutate({ id: currentWarehouse.id, data: formData }, {
        onSuccess: () => {
          toast({ title: "Thành công", description: "Cập nhật kho hàng thành công" })
          setIsModalOpen(false)
        },
        onError: (error: any) => toast({ title: "Lỗi", description: error.message, variant: "destructive" })
      })
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast({ title: "Thành công", description: "Thêm kho mới thành công" })
          setIsModalOpen(false)
        },
        onError: (error: any) => toast({ title: "Lỗi", description: error.message, variant: "destructive" })
      })
    }
  }

  // 5. Xóa Kho
  const handleDelete = async () => {
    if (!currentWarehouse) return
    deleteMutation.mutate(currentWarehouse.id, {
      onSuccess: () => {
        toast({ title: "Thành công", description: "Đã xóa kho hàng" })
        setIsDeleteAlertOpen(false)
      },
      onError: (error: any) => toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    })
  }

  // Local Filter
  const filteredWarehouses = warehouses.filter((wh) =>
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
          <Plus className="w-4 h-4" /> Thêm kho mới
        </Button>
      </div>

      {/* Stats Cards (Tính toán từ dữ liệu thật) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          label="Tổng số kho"
          value={warehouses.length}
          icon={MapPin}
          description={`${warehouses.filter((w) => w.loai_kho === 'KHO_CHINH').length} kho chính`}
        />
        <StatsCard
          label="Đang hoạt động"
          value={warehouses.filter((w) => w.trang_thai === 'HOAT_DONG').length}
          icon={Package}
          iconClassName="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm tên kho, mã kho..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
              {isFetching ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Đang tải dữ liệu...</td></tr>
              ) : filteredWarehouses.length > 0 ? (
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${wh.trang_thai === 'HOAT_DONG' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
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
                <Input required placeholder="VD: KHO-HN01" value={formData.ma_kho} onChange={e => setFormData({ ...formData, ma_kho: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tên Kho</Label>
                <Input required placeholder="Kho Trung tâm..." value={formData.ten_kho} onChange={e => setFormData({ ...formData, ten_kho: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Địa chỉ chi tiết</Label>
              <Input required placeholder="Số nhà, đường..." value={formData.dia_chi} onChange={e => setFormData({ ...formData, dia_chi: e.target.value })} />
            </div>

            <AddressSelector
              province={formData.tinh_thanh}
              district={formData.quan_huyen}
              ward={formData.phuong_xa}
              onProvinceChange={(val: string) => setFormData({ ...formData, tinh_thanh: val, quan_huyen: "", phuong_xa: "" })}
              onDistrictChange={(val: string) => setFormData({ ...formData, quan_huyen: val, phuong_xa: "" })}
              onWardChange={(val: string) => setFormData({ ...formData, phuong_xa: val })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại Kho</Label>
                <Select value={formData.loai_kho} onValueChange={(val: string) => setFormData({ ...formData, loai_kho: val })}>
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
                <Select value={formData.trang_thai} onValueChange={(val: string) => setFormData({ ...formData, trang_thai: val })}>
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
              <Input type="number" value={formData.suc_chua_toi_da} onChange={e => setFormData({ ...formData, suc_chua_toi_da: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea value={formData.ghi_chu} onChange={e => setFormData({ ...formData, ghi_chu: e.target.value })} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Lưu thông tin"}</Button>
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
              <br /><span className="text-red-500 text-xs">Lưu ý: Không thể xóa kho nếu đang có đơn hàng liên kết.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAlertOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa ngay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}