"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, User, Car, X, CheckCircle, FileImage, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ProfilePage() {
  const { user, updateProfile, isLoading, logout } = useAuth()
  const { toast } = useToast()

  // --- STATE CÁ NHÂN ---
  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    dia_chi: "",
  })
  const [preview, setPreview] = useState<string | undefined>()
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- STATE TÀI XẾ ---
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false)
  const [driverForm, setDriverForm] = useState({
    so_gplx: "",
    hang_bang: "B2",
    kinh_nghiem: "",
    ngay_het_han: "",
  })
  const [frontLicenseFile, setFrontLicenseFile] = useState<File | null>(null)
  const [backLicenseFile, setBackLicenseFile] = useState<File | null>(null)
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        ho_ten: user.ho_ten || "",
        email: user.email || "",
        so_dien_thoai: user.so_dien_thoai || "",
        dia_chi: user.dia_chi || "",
      });
      setPreview(user.anh_dai_dien);
    }
  }, [user]);

  // --- HANDLE CÁ NHÂN ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // HÀM SUBMIT PROFILE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Lấy token
    const token = localStorage.getItem("token_user"); 
    
    if(!token) {
        toast({
            variant: "destructive",
            title: "Lỗi xác thực",
            description: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
        })
        return
    }

    try {
        const formDataPayload = new FormData();
        formDataPayload.append("ho_ten", formData.ho_ten);
        formDataPayload.append("so_dien_thoai", formData.so_dien_thoai);
        formDataPayload.append("dia_chi", formData.dia_chi);

        if(avatarFile) {
          formDataPayload.append("avatar", avatarFile);
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formDataPayload,
        });

        const data = await res.json();

        if (!res.ok) {
            if (res.status === 401) {
                logout();
                return;
            }
            throw new Error(data.message || "Lỗi cập nhật");
        }

        updateProfile(data.user);

        toast({
            title: "Cập nhật thành công!",
            description: "Thông tin hồ sơ của bạn đã được lưu.",
            className: "bg-green-600 text-white border-none",
        })

    } catch (error:any) {
        console.error("Lỗi:", error);
        toast({
            variant: "destructive",
            title: "Cập nhật thất bại",
            description: error.message || "Có lỗi xảy ra."
        })
    }
  }

  // --- HANDLE TÀI XẾ ---
  const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setDriverForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'FRONT' | 'BACK') => {
    if (e.target.files && e.target.files[0]) {
        if (type === 'FRONT') setFrontLicenseFile(e.target.files[0])
        else setBackLicenseFile(e.target.files[0])
    }
  }

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token_user");

    if (!frontLicenseFile || !backLicenseFile) {
        toast({ variant: "destructive", title: "Thiếu ảnh hồ sơ", description: "Vui lòng tải lên đủ 2 mặt bằng lái." })
        return
    }

    setIsSubmittingDriver(true)

    try {
        const formData = new FormData()
        formData.append("so_gplx", driverForm.so_gplx)
        formData.append("hang_bang", driverForm.hang_bang)
        formData.append("kinh_nghiem", driverForm.kinh_nghiem)
        formData.append("ngay_het_han", driverForm.ngay_het_han)
        formData.append("licenseImages", frontLicenseFile)
        formData.append("licenseImages", backLicenseFile)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drivers/register`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        })

        const data = await res.json()

        if (res.ok) {
            toast({
                title: "Gửi hồ sơ thành công!",
                description: "Vui lòng chờ Admin xét duyệt.",
                className: "bg-green-600 text-white border-none",
            })
            setIsDriverModalOpen(false)
            // Reset form
            setFrontLicenseFile(null); setBackLicenseFile(null);
            setDriverForm({ so_gplx: "", hang_bang: "B2", kinh_nghiem: "", ngay_het_han: "" })
        } else {
             if (res.status === 401) { logout(); return; }
             throw new Error(data.message || "Đăng ký thất bại")
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Gửi hồ sơ thất bại", description: error.message })
    } finally {
        setIsSubmittingDriver(false)
    }
  }

  // --- RENDER ---
  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ); 
  
  if (!user) {
      if (typeof window !== 'undefined') logout(); 
      return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 py-12 px-4 relative">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Hồ sơ cá nhân</CardTitle>
                <CardDescription>Quản lý thông tin tài khoản và vai trò</CardDescription>
              </CardHeader>
              <CardContent>
                {/* FORM USER */}
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 relative group">
                      {preview ? 
                        <img src={preview} alt="Avatar" className="h-full w-full object-cover" /> 
                        : <User className="h-10 w-10 text-slate-400" />
                      }
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="text-white h-6 w-6" />
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Đổi ảnh
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>

                  <div className="space-y-4">
                      <div className="space-y-2">
                          <Label>Họ và tên</Label>
                          <Input name="ho_ten" value={formData.ho_ten} onChange={handleInputChange} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label>Email</Label>
                              <Input name="email" value={formData.email} disabled className="bg-slate-100" />
                          </div>
                          <div className="space-y-2">
                              <Label>Số điện thoại</Label>
                              <Input name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleInputChange} />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label>Địa chỉ</Label>
                          <Input name="dia_chi" value={formData.dia_chi} onChange={handleInputChange} />
                      </div>
                  </div>
                  <Button type="submit" className="w-full">Lưu thay đổi</Button>
                </form>

                {/* KHU VỰC TÀI XẾ */}
                <div className="mt-10 pt-6 border-t border-dashed">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <Car className="h-5 w-5 text-blue-600" /> Đối tác vận chuyển
                  </h3>
                  
                  {user.vai_tro === 'TAI_XE' ? (
                       <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 border border-green-200">
                          <CheckCircle className="h-5 w-5" />
                          Bạn đã là Tài xế chính thức của VietLogistics
                       </div>
                  ) : (
                      <>
                          <p className="text-sm text-muted-foreground mb-4">Gia tăng thu nhập cùng VietLogistics.</p>
                          <Button 
                          onClick={() => setIsDriverModalOpen(true)} 
                          variant="secondary" 
                          className="w-full border-2 border-blue-100 hover:bg-blue-50 text-blue-700"
                          >
                          Đăng ký trở thành Tài xế
                          </Button>
                      </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* --- MODAL ĐĂNG KÝ TÀI XẾ --- */}
        <AnimatePresence>
          {isDriverModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-5 border-b">
                  <h2 className="text-xl font-bold">Hồ sơ Tài xế</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsDriverModalOpen(false)}><X className="h-5 w-5" /></Button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <form id="driver-form" onSubmit={handleDriverSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label>Số Giấy phép lái xe <span className="text-red-500">*</span></Label>
                      <Input name="so_gplx" required value={driverForm.so_gplx} onChange={handleDriverChange} placeholder="Nhập số trên bằng lái..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Hạng bằng</Label>
                        <select 
                          name="hang_bang" value={driverForm.hang_bang} onChange={handleDriverChange}
                          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="B2">Hạng B2</option>
                          <option value="C">Hạng C</option>
                          <option value="D">Hạng D</option>
                          <option value="FC">Hạng FC</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Kinh nghiệm (năm)</Label>
                        <Input name="kinh_nghiem" type="number" required value={driverForm.kinh_nghiem} onChange={handleDriverChange} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Ngày hết hạn bằng</Label>
                      <Input name="ngay_het_han" type="date" required value={driverForm.ngay_het_han} onChange={handleDriverChange} />
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-base font-semibold">Ảnh chụp bằng lái</Label>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Mặt trước</Label>
                              <div className={`border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-50 transition-colors ${frontLicenseFile ? 'border-green-500 bg-green-50' : 'border-slate-300'}`}>
                                  <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'FRONT')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                  {frontLicenseFile ? (
                                      <div className="text-center px-2">
                                          <FileImage className="h-8 w-8 text-green-600 mx-auto mb-1" />
                                          <p className="text-xs text-green-700 truncate max-w-full">{frontLicenseFile.name}</p>
                                      </div>
                                  ) : (
                                      <> <Upload className="h-6 w-6 text-slate-400 mb-1" /> <span className="text-xs text-slate-500">Tải lên</span> </>
                                  )}
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Mặt sau</Label>
                              <div className={`border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-50 transition-colors ${backLicenseFile ? 'border-green-500 bg-green-50' : 'border-slate-300'}`}>
                                  <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'BACK')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                  {backLicenseFile ? (
                                      <div className="text-center px-2">
                                          <FileImage className="h-8 w-8 text-green-600 mx-auto mb-1" />
                                          <p className="text-xs text-green-700 truncate max-w-full">{backLicenseFile.name}</p>
                                      </div>
                                  ) : (
                                      <> <Upload className="h-6 w-6 text-slate-400 mb-1" /> <span className="text-xs text-slate-500">Tải lên</span> </>
                                  )}
                              </div>
                          </div>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="p-5 border-t bg-slate-50 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setIsDriverModalOpen(false)}>Hủy bỏ</Button>
                  <Button type="submit" form="driver-form" disabled={isSubmittingDriver}>
                      {isSubmittingDriver ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang gửi...</> : "Gửi hồ sơ"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}