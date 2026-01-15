"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Phone, MapPin, Truck, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DriverProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Header Profile */}
      <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center space-y-3">
        <Avatar className="w-24 h-24 border-4 border-blue-100">
            <AvatarImage src={user.anh_dai_dien || ""} />
            <AvatarFallback className="text-2xl bg-blue-600 text-white">
                {user.ho_ten?.charAt(0) || "T"}
            </AvatarFallback>
        </Avatar>
        <div className="text-center">
            <h2 className="font-bold text-xl text-slate-800">{user.ho_ten}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <ShieldCheck className="w-3 h-3 mr-1" /> Tài xế chính thức
            </div>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="space-y-4">
        <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase text-gray-400 font-semibold">Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Phone className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Số điện thoại</p>
                        <p className="font-medium">{user.so_dien_thoai || "Chưa cập nhật"}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Địa chỉ</p>
                        <p className="font-medium">{user.dia_chi || "Chưa cập nhật"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase text-gray-400 font-semibold">Công việc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <Truck className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Trạng thái hoạt động</p>
                        <p className="font-medium text-green-600">Đang sẵn sàng nhận đơn</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Nút Đăng xuất */}
      <Button 
        variant="destructive" 
        className="w-full h-12 text-base shadow-sm mt-4"
        onClick={logout}
      >
        <LogOut className="w-5 h-5 mr-2" /> Đăng xuất tài khoản
      </Button>
    </div>
  )
}