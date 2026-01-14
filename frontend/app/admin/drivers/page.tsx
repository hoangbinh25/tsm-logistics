"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Check, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminDriversPage() {
  const { http } = useAuth() // Dùng hàm http có sẵn trong Context
  const { toast } = useToast()
  
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("PENDING") // PENDING | APPROVED | REJECTED

  // State cho Modal xem chi tiết
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // 1. Fetch dữ liệu
  const fetchDrivers = async () => {
    setLoading(true)
    try {
      // Gọi API list (có thể thêm param ?status=${filter} nếu backend hỗ trợ)
      const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/drivers/list?status=${filter}`)
      const data = await res.json()
      setDrivers(data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [filter])

  // 2. Hàm Duyệt / Từ chối
  const handleVerify = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedDriver) return
    setIsProcessing(true)
    try {
        const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/drivers/verify/${selectedDriver.id}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                status, 
                reason: status === 'REJECTED' ? "Thông tin không hợp lệ" : "" 
            })
        })
        
        if (res.ok) {
            toast({ title: "Thành công", description: `Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} hồ sơ.` })
            setIsModalOpen(false)
            fetchDrivers() // Reload lại danh sách
        } else {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể cập nhật trạng thái." })
        }
    } catch (error) {
        console.error(error)
    } finally {
        setIsProcessing(false)
    }
  }

  // Helper: Tìm ảnh trong mảng giay_to
  const getLicenseImage = (driver: any, type: string) => {
    return driver.giay_to?.find((g: any) => g.loai === type)?.file_url || "/placeholder.jpg"
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Tài xế</h1>
      </div>

      <Card>
        <CardHeader>
            <Tabs defaultValue="PENDING" onValueChange={setFilter} className="w-full">
                <TabsList>
                    <TabsTrigger value="PENDING">Chờ duyệt</TabsTrigger>
                    <TabsTrigger value="APPROVED">Đã duyệt</TabsTrigger>
                    <TabsTrigger value="REJECTED">Đã từ chối</TabsTrigger>
                </TabsList>
            </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Số GPLX</TableHead>
                  <TableHead>Kinh nghiệm</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.length === 0 && <TableRow><TableCell colSpan={7} className="text-center h-24">Không có dữ liệu</TableCell></TableRow>}
                
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.nguoi_dung?.ho_ten}</TableCell>
                    <TableCell>{driver.nguoi_dung?.so_dien_thoai}</TableCell>
                    <TableCell>{driver.so_giay_phep_lai_xe} <Badge variant="outline">{driver.hang_bang_lai}</Badge></TableCell>
                    <TableCell>{driver.kinh_nghiem_nam} năm</TableCell>
                    <TableCell>{new Date(driver.thoi_gian_tao).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                        <Badge variant={driver.trang_thai_duyet === 'APPROVED' ? 'default' : driver.trang_thai_duyet === 'REJECTED' ? 'destructive' : 'secondary'}>
                            {driver.trang_thai_duyet}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedDriver(driver); setIsModalOpen(true) }}>
                        <Eye className="h-4 w-4 mr-1" /> Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* --- MODAL CHI TIẾT --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-5xl w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xét duyệt hồ sơ tài xế</DialogTitle>
          </DialogHeader>

          {selectedDriver && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Cột thông tin */}
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                        <h3 className="font-semibold border-b pb-2">Thông tin cá nhân</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Họ tên:</span> <span>{selectedDriver.nguoi_dung?.ho_ten}</span>
                            <span className="text-muted-foreground">Email:</span> <span>{selectedDriver.nguoi_dung?.email}</span>
                            <span className="text-muted-foreground">SĐT:</span> <span>{selectedDriver.nguoi_dung?.so_dien_thoai}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                        <h3 className="font-semibold border-b pb-2">Thông tin Bằng lái</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Số GPLX:</span> <span className="font-mono font-bold">{selectedDriver.so_giay_phep_lai_xe}</span>
                            <span className="text-muted-foreground">Hạng:</span> <span>{selectedDriver.hang_bang_lai}</span>
                            <span className="text-muted-foreground">Hết hạn:</span> <span>{new Date(selectedDriver.ngay_het_han_gplx).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                </div>

                {/* Cột hình ảnh */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Ảnh chụp GPLX</h3>
                    <div className="space-y-4">
                        <div className="relative border rounded-lg overflow-hidden group">
                            <p className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Mặt trước</p>
                            <img 
                                src={getLicenseImage(selectedDriver, 'GPLX_MAT_TRUOC')} 
                                alt="Mặt trước" 
                                className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer" 
                                onClick={() => window.open(getLicenseImage(selectedDriver, 'GPLX_MAT_TRUOC'), '_blank')}
                            />
                        </div>
                        <div className="relative border rounded-lg overflow-hidden group">
                            <p className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Mặt sau</p>
                            <img 
                                src={getLicenseImage(selectedDriver, 'GPLX_MAT_SAU')} 
                                alt="Mặt sau" 
                                className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => window.open(getLicenseImage(selectedDriver, 'GPLX_MAT_SAU'), '_blank')}
                            />
                        </div>
                    </div>
                </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Đóng</Button>
            
            {/* Chỉ hiện nút duyệt nếu đang ở trạng thái PENDING */}
            {selectedDriver?.trang_thai_duyet === 'PENDING' && (
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => handleVerify('REJECTED')} disabled={isProcessing}>
                        <X className="w-4 h-4 mr-2" /> Từ chối
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleVerify('APPROVED')} disabled={isProcessing}>
                        <Check className="w-4 h-4 mr-2" /> Duyệt hồ sơ
                    </Button>
                </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}