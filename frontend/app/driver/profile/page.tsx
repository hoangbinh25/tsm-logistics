"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Phone, MapPin, Truck, ShieldCheck, Edit2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function DriverProfilePage() {
    const { user, logout, http, updateProfile } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        ho_ten: user?.ho_ten || "",
        so_dien_thoai: user?.so_dien_thoai || "",
    })

    const [selectedAddress, setSelectedAddress] = useState({
        province: "",
        district: "",
        ward: "",
        detail: ""
    })

    // State cho API Tỉnh/Thành
    const [provinces, setProvinces] = useState<any[]>([])
    const [districts, setDistricts] = useState<any[]>([])
    const [wards, setWards] = useState<any[]>([])

    // Fetch Tỉnh/Thành
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(err => console.error("Lỗi fetch tỉnh:", err))
    }, [])

    // Fetch Quận/Huyện khi chọn Tỉnh
    useEffect(() => {
        if (!selectedAddress.province) {
            setDistricts([])
            return
        }
        const provinceCode = provinces.find(p => p.name === selectedAddress.province)?.code
        if (provinceCode) {
            fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
                .then(res => res.json())
                .then(data => setDistricts(data.districts))
                .catch(err => console.error("Lỗi fetch huyện:", err))
        }
    }, [selectedAddress.province, provinces])

    // Fetch Phường/Xã khi chọn Huyện
    useEffect(() => {
        if (!selectedAddress.district) {
            setWards([])
            return
        }
        const districtCode = districts.find(d => d.name === selectedAddress.district)?.code
        if (districtCode) {
            fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
                .then(res => res.json())
                .then(data => setWards(data.wards))
                .catch(err => console.error("Lỗi fetch xã:", err))
        }
    }, [selectedAddress.district, districts])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const fullAddress = selectedAddress.province
                ? `${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`
                : user?.dia_chi

            const payload = {
                ho_ten: formData.ho_ten,
                so_dien_thoai: formData.so_dien_thoai,
                dia_chi: fullAddress
            }

            const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
                method: "PUT",
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                const result = await res.json()
                toast({ title: "Thành công", description: "Cập nhật hồ sơ thành công!" })
                updateProfile(result.user)
                setIsEditing(false)
            } else {
                const data = await res.json()
                throw new Error(data.message || "Cập nhật thất bại")
            }
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

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
                <div className="text-center w-full relative">
                    <h2 className="font-bold text-xl text-slate-800">{user.ho_ten}</h2>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Tài xế chính thức
                    </div>

                    {/* Nút Sửa */}
                    <div className="absolute top-0 right-0">
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Cập nhật hồ sơ</DialogTitle>
                                    <DialogDescription>Chỉnh sửa thông tin cá nhân của bạn</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>Họ tên</Label>
                                        <Input value={formData.ho_ten} onChange={e => setFormData({ ...formData, ho_ten: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Số điện thoại</Label>
                                        <Input value={formData.so_dien_thoai} onChange={e => setFormData({ ...formData, so_dien_thoai: e.target.value })} required />
                                    </div>

                                    <div className="space-y-3 pt-2 border-t">
                                        <Label className="font-semibold">Cập nhật địa chỉ mới (nếu cần)</Label>
                                        <Select value={selectedAddress.province} onValueChange={(val) => setSelectedAddress({ ...selectedAddress, province: val, district: "", ward: "" })}>
                                            <SelectTrigger><SelectValue placeholder="Chọn Tỉnh / Thành phố" /></SelectTrigger>
                                            <SelectContent>{provinces.map(p => <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                                        </Select>

                                        <Select value={selectedAddress.district} onValueChange={(val) => setSelectedAddress({ ...selectedAddress, district: val, ward: "" })} disabled={!selectedAddress.province}>
                                            <SelectTrigger><SelectValue placeholder="Chọn Quận / Huyện" /></SelectTrigger>
                                            <SelectContent>{districts.map(d => <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                                        </Select>

                                        <Select value={selectedAddress.ward} onValueChange={(val) => setSelectedAddress({ ...selectedAddress, ward: val })} disabled={!selectedAddress.district}>
                                            <SelectTrigger><SelectValue placeholder="Chọn Phường / Xã" /></SelectTrigger>
                                            <SelectContent>{wards.map(w => <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>)}</SelectContent>
                                        </Select>

                                        <Input placeholder="Số nhà, tên đường..." value={selectedAddress.detail} onChange={e => setSelectedAddress({ ...selectedAddress, detail: e.target.value })} />
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Lưu thay đổi
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
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