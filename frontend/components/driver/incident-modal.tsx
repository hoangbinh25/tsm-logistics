"use client"

import { useState } from "react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle, Camera, MapPin } from "lucide-react"
import { fetchWithAuth } from "@/utils/api"
import toast from "react-hot-toast"

interface IncidentModalProps {
    isOpen: boolean
    onClose: () => void
    orderId?: string
    orderCode?: string
}

export function IncidentModal({ isOpen, onClose, orderId, orderCode }: IncidentModalProps) {
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState<string>("HU_HONG_XE")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")

    const handleSubmit = async () => {
        if (!description.trim()) {
            toast.error("Vui lòng mô tả chi tiết sự cố")
            return
        }

        setLoading(true)
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/incidents/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    donHangId: orderId,
                    loaiSuCo: type,
                    moTa: description,
                    viTri: location
                })
            })

            if (res.ok) {
                toast.success("Báo cáo sự cố đã được gửi tới Admin")
                setDescription("")
                setLocation("")
                onClose()
            } else {
                const error = await res.json()
                toast.error(error.message || "Lỗi khi gửi báo cáo")
            }
        } catch (err: any) {
            console.error("Incident Report Error:", err)
            toast.error(err.message || "Lỗi kết nối hệ thống")
        } finally {
            setLoading(false)
        }
    }

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation(`${position.coords.latitude}, ${position.coords.longitude}`)
                toast.success("Đã lấy vị trí hiện tại")
            }, () => {
                toast.error("Không thể lấy vị trí. Vui lòng bật định vị.")
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-t-2xl sm:rounded-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" /> Báo cáo sự cố
                    </DialogTitle>
                    <DialogDescription>
                        {orderCode ? `Báo cáo cho đơn hàng ${orderCode}` : "Thông báo sự cố phát sinh trong quá trình vận chuyển."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Loại sự cố</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại sự cố" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HU_HONG_XE">Hư hỏng xe</SelectItem>
                                <SelectItem value="TAI_NAN">Tai nạn giao thông</SelectItem>
                                <SelectItem value="KET_XE">Tắc đường nghiêm trọng</SelectItem>
                                <SelectItem value="HANG_HOA_HU_HONG">Hàng hóa hư hỏng</SelectItem>
                                <SelectItem value="SU_CO_SUC_KHOE">Sức khỏe tài xế</SelectItem>
                                <SelectItem value="KHAC">Lý do khác</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả chi tiết</Label>
                        <Textarea
                            placeholder="Nhập tình trạng hiện tại, nguyên nhân..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="h-24"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Vị trí</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Tọa độ hoặc địa chỉ"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={getCurrentLocation}>
                                <MapPin className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button variant="outline" className="gap-2 text-xs" disabled>
                            <Camera className="w-4 h-4" /> Chụp ảnh
                        </Button>
                        <p className="text-[10px] text-muted-foreground flex items-center">Tính năng đang phát triển</p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>Hủy</Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang gửi..." : "Gửi báo cáo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


