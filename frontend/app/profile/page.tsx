"use client"

import type React from "react"
import { useState, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, User, Car, X } from "lucide-react" 
import { motion, AnimatePresence } from "framer-motion"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  
  const [formData, setFormData] = useState({
    ho_ten: user?.ho_ten || "",
    email: user?.email || "",
    so_dien_thoai: user?.so_dien_thoai || "",
    dia_chi: user?.dia_chi || "",
  })
  const [preview, setPreview] = useState<string | undefined>(user?.anh_dai_dien)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- STATE MỚI CHO PHẦN TÀI XẾ ---
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false)
  const [driverForm, setDriverForm] = useState({
    so_gplx: "",
    hang_bang: "B2",
    kinh_nghiem: "",
    ngay_het_han: "",
  })
  // State lưu file ảnh bằng lái (mặt trước/sau)
  const [licenseFiles, setLicenseFiles] = useState<FileList | null>(null)

  // --- HANDLE CŨ ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ ...formData, anh_dai_dien: preview })
    alert("Cập nhật hồ sơ cá nhân thành công!")
  }

  // --- HANDLE MỚI CHO TÀI XẾ ---
  const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setDriverForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLicenseFiles(e.target.files)
    }
  }

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // log ra console để kiểm tra
    console.log("Thông tin tài xế:", driverForm)
    console.log("File giấy tờ:", licenseFiles)
    alert("Đã gửi yêu cầu đăng ký tài xế! (Chờ tích hợp API)")
    setIsDriverModalOpen(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
          <Button asChild><Link href="/login">Đăng nhập</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 relative">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Hồ sơ cá nhân</CardTitle>
              <CardDescription>Quản lý thông tin tài khoản và vai trò của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {/* --- FORM CÁ NHÂN --- */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    {preview ? (
                      <img src={preview || "/placeholder.svg"} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                      <Upload className="h-4 w-4" /> Tải lên ảnh
                    </Button>
                  </div>
                </div>

                {/* Các trường thông tin cá nhân */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ho_ten">Họ và tên</Label>
                    <Input id="ho_ten" name="ho_ten" value={formData.ho_ten} onChange={handleInputChange} className="h-11" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
                      <Input id="so_dien_thoai" name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleInputChange} className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dia_chi">Địa chỉ</Label>
                    <Input id="dia_chi" name="dia_chi" value={formData.dia_chi} onChange={handleInputChange} className="h-11" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" size="lg">Cập nhật hồ sơ</Button>
              </form>

              {/* --- PHẦN MỚI: KHU VỰC ĐĂNG KÝ TÀI XẾ --- */}
              <div className="mt-10 pt-6 border-t border-dashed">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <Car className="h-5 w-5 text-blue-600" /> 
                  Đối tác vận chuyển
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Trở thành tài xế để nhận đơn hàng và gia tăng thu nhập ngay hôm nay.
                </p>
                
                {/* Logic hiển thị nút: Nếu chưa là tài xế thì hiện nút đăng ký */}
                <Button 
                  onClick={() => setIsDriverModalOpen(true)} 
                  variant="secondary" 
                  className="w-full h-11 border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 text-blue-700"
                >
                  Đăng ký trở thành Tài xế
                </Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* --- MODAL (POPUP) ĐĂNG KÝ TÀI XẾ --- */}
      <AnimatePresence>
        {isDriverModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-xl shadow-xl w-full max-w-lg overflow-hidden border"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">Đăng ký Tài xế</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsDriverModalOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Modal Body: Driver Form */}
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <form id="driver-form" onSubmit={handleDriverSubmit} className="space-y-5">
                  
                  <div className="space-y-2">
                    <Label htmlFor="so_gplx">Số Giấy phép lái xe</Label>
                    <Input 
                      id="so_gplx" name="so_gplx" required placeholder="Nhập số GPLX..." 
                      value={driverForm.so_gplx} onChange={handleDriverChange} className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hang_bang">Hạng bằng</Label>
                      {/* Dùng select native cho đơn giản, có thể thay bằng Select Component */}
                      <select 
                        id="hang_bang" name="hang_bang" 
                        value={driverForm.hang_bang} onChange={handleDriverChange}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="B2">Hạng B2</option>
                        <option value="C">Hạng C</option>
                        <option value="FC">Hạng FC</option>
                        <option value="D">Hạng D</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="kinh_nghiem">Kinh nghiệm (năm)</Label>
                      <Input 
                        id="kinh_nghiem" name="kinh_nghiem" type="number" min="0" required
                        value={driverForm.kinh_nghiem} onChange={handleDriverChange} className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ngay_het_han">Ngày hết hạn bằng</Label>
                    <Input 
                      id="ngay_het_han" name="ngay_het_han" type="date" required
                      value={driverForm.ngay_het_han} onChange={handleDriverChange} className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ảnh chụp GPLX (Mặt trước & Sau)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                      <Input 
                        type="file" multiple accept="image/*" 
                        onChange={handleLicenseUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {licenseFiles && licenseFiles.length > 0 
                            ? `Đã chọn ${licenseFiles.length} file` 
                            : "Click để tải ảnh lên"}
                        </span>
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t bg-muted/20 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDriverModalOpen(false)}>Hủy</Button>
                <Button type="submit" form="driver-form">Gửi hồ sơ</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}