"use client"

import { useState, useEffect } from "react"
import {
    AlertTriangle, CheckCircle2, Clock, Eye,
    MapPin, User, Package, Filter, Search,
    MoreHorizontal, MessageSquare
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchWithAuth } from "@/utils/api"
import { format } from "date-fns"
import toast from "react-hot-toast"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function IncidentsAdminPage() {
    const [incidents, setIncidents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedIncident, setSelectedIncident] = useState<any>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [adminNote, setAdminNote] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const fetchIncidents = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/incidents`)
            if (res.ok) {
                const payload = await res.json()
                setIncidents(payload.data || [])
            }
        } catch (error) {
            console.error("Lỗi tải sự cố", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIncidents()
    }, [])

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setSubmitting(true)
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/incidents/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    ghi_chu_quan_ly: adminNote
                })
            })

            if (res.ok) {
                toast.success("Đã cập nhật tình trạng xử lý")
                setIsDetailOpen(false)
                fetchIncidents()
            } else {
                toast.error("Lỗi cập nhật")
            }
        } catch (err) {
            toast.error("Lỗi kết nối")
        } finally {
            setSubmitting(false)
        }
    }

    const filteredIncidents = incidents.filter(i =>
        i.tai_xe?.nguoi_dung?.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.loai_su_co.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.don_hang?.ma_don_hang?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'MOI': return <Badge className="bg-red-100 text-red-700 border-red-200">Mới</Badge>
            case 'DANG_XU_LY': return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Đang xử lý</Badge>
            case 'DA_XU_LY': return <Badge className="bg-green-100 text-green-700 border-green-200">Đã xong</Badge>
            case 'HUY': return <Badge variant="outline" className="text-slate-400">Đã hủy</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const getIncidentTypeLabel = (type: string) => {
        const map: any = {
            'HU_HONG_XE': 'Hư hỏng xe',
            'TAI_NAN': 'Tai nạn',
            'KET_XE': 'Tắc đường',
            'HANG_HOA_HU_HONG': 'Hư hỏng hàng',
            'SU_CO_SUC_KHOE': 'Sức khỏe',
            'KHAC': 'Khác'
        }
        return map[type] || type
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <AlertTriangle className="text-red-500" /> Quản lý Sự cố
                    </h1>
                    <p className="text-sm text-muted-foreground">Theo dõi và xử lý các vấn đề phát sinh từ tài xế đường trường.</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo tài xế, mã đơn, loại sự cố..."
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 bg-white">
                    <Filter className="h-4 w-4" /> Bộ lọc
                </Button>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-bold">
                        <tr>
                            <th className="px-6 py-4">Thời gian</th>
                            <th className="px-6 py-4">Tài xế</th>
                            <th className="px-6 py-4">Sự cố</th>
                            <th className="px-6 py-4">Đơn hàng</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center">Đang tải...</td></tr>
                        ) : filteredIncidents.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Không có bản ghi nào.</td></tr>
                        ) : filteredIncidents.map((incident) => (
                            <tr key={incident.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-slate-900 font-medium">{format(new Date(incident.thoi_gian_tao), "HH:mm")}</div>
                                    <div className="text-[10px] text-slate-500">{format(new Date(incident.thoi_gian_tao), "dd/MM/yyyy")}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold">{incident.tai_xe?.nguoi_dung?.ho_ten}</div>
                                    <div className="text-xs text-slate-500">{incident.tai_xe?.nguoi_dung?.so_dien_thoai}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="font-semibold text-red-600">{getIncidentTypeLabel(incident.loai_su_co)}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 truncate max-w-[150px]">{incident.mo_ta}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="font-mono text-[10px]">{incident.don_hang?.ma_don_hang || "KHÔNG CÓ"}</Badge>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(incident.trang_thai)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setSelectedIncident(incident);
                                        setAdminNote(incident.ghi_chu_quan_ly || "");
                                        setIsDetailOpen(true);
                                    }}>
                                        <Eye className="w-4 h-4 mr-1" /> Xử lý
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL CHI TIẾT & XỬ LÝ */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-red-500" /> Chi tiết báo cáo sự cố
                        </DialogTitle>
                        <DialogDescription>
                            ID sự cố: {selectedIncident?.id}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedIncident && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Tài xế</p>
                                    <p className="font-bold text-sm">{selectedIncident.tai_xe?.nguoi_dung?.ho_ten}</p>
                                    <p className="text-xs text-slate-500">{selectedIncident.tai_xe?.nguoi_dung?.so_dien_thoai}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> Đơn hàng</p>
                                    <p className="font-bold text-sm">{selectedIncident.don_hang?.ma_don_hang || "---"}</p>
                                    <p className="text-xs text-slate-500">Mã: {selectedIncident.don_hang_id || "Chưa chọn đơn"}</p>
                                </div>
                            </div>

                            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                                <p className="text-xs font-bold text-red-600 uppercase mb-2">Nội dung báo cáo</p>
                                <p className="text-sm italic leading-relaxed text-slate-700">"{selectedIncident.mo_ta}"</p>
                                {selectedIncident.vi_tri && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 border-t pt-2">
                                        <MapPin className="w-3 h-3" />
                                        Vị trí: {selectedIncident.vi_tri}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Ghi chú từ Admin (Phản hồi cho tài xế)</Label>
                                <Textarea
                                    placeholder="Nhập ghi chú xử lý, phương án giải quyết..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    className="h-20"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between gap-2 overflow-x-auto">
                        <div className="flex gap-2 w-full">
                            <Button
                                variant="outline"
                                className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                onClick={() => handleUpdateStatus(selectedIncident.id, 'DA_XU_LY')}
                                disabled={submitting}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Đã xử lý xong
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                                onClick={() => handleUpdateStatus(selectedIncident.id, 'DANG_XU_LY')}
                                disabled={submitting}
                            >
                                <Clock className="w-4 h-4 mr-2" /> Đang xử lý
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
