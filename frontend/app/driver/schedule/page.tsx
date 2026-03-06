"use client"
import { useEffect, useState } from "react"
import { Calendar, Clock, CheckCircle2, AlertCircle, ChevronRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchWithAuth } from "@/utils/api"
import toast from "react-hot-toast"
import { format, addDays, startOfDay } from "date-fns"
import { vi } from "date-fns/locale"

export default function DriverSchedulePage() {
    const [schedules, setSchedules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Tạo danh sách 14 ngày tới
    const next14Days = Array.from({ length: 14 }, (_, i) => startOfDay(addDays(new Date(), i)))

    const [selectedDates, setSelectedDates] = useState<Record<string, { shift: string, note: string }>>({})

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/schedules/my-schedules`)
                if (res.ok) {
                    const data = await res.json()
                    setSchedules(data)

                    // Map data vào state selectedDates
                    const mapped: any = {}
                    data.forEach((item: any) => {
                        const dateKey = format(new Date(item.ngay_lam_viec), 'yyyy-MM-dd')
                        mapped[dateKey] = { shift: item.ca_lam_viec, note: item.ghi_chu, status: item.trang_thai }
                    })
                    setSelectedDates(mapped)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchSchedules()
    }, [])

    const toggleDate = (date: Date) => {
        const key = format(date, 'yyyy-MM-dd')
        const newSelected = { ...selectedDates }
        if (newSelected[key]) {
            delete newSelected[key]
        } else {
            newSelected[key] = { shift: "CA_NGAY", note: "" }
        }
        setSelectedDates(newSelected)
    }

    const handleSave = async () => {
        setSubmitting(true)
        try {
            const payload = Object.entries(selectedDates).map(([date, val]) => ({
                date,
                shift: val.shift,
                note: val.note
            }))

            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/schedules/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dates: payload })
            })

            if (res.ok) {
                toast.success("Đã lưu lịch làm việc thành công!")
            } else {
                toast.error("Có lỗi xảy ra khi lưu lịch")
            }
        } catch (e) {
            console.error(e)
            toast.error("Lỗi kết nối")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-10 text-center">Đang tải...</div>

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
                <h1 className="font-bold text-lg flex items-center gap-2">
                    <Calendar className="text-blue-600 w-5 h-5" /> Đăng ký lịch làm việc
                </h1>
                <Button
                    size="sm"
                    className="gap-2 bg-blue-600"
                    onClick={handleSave}
                    disabled={submitting}
                >
                    <Save className="w-4 h-4" /> {submitting ? "Đang lưu..." : "Lưu lịch"}
                </Button>
            </div>

            <div className="p-4 space-y-3">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-2 items-start mb-4">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p className="text-xs text-blue-700">
                        Vui lòng chọn các ngày bạn có thể đi làm trong 2 tuần tới. Quản lý sẽ dựa vào đây để điều phối đơn hàng.
                    </p>
                </div>

                <div className="space-y-2">
                    {next14Days.map((date) => {
                        const key = format(date, 'yyyy-MM-dd')
                        const isSelected = !!selectedDates[key]
                        const schedule = selectedDates[key] as any

                        return (
                            <div
                                key={key}
                                onClick={() => toggleDate(date)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                                        ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500"
                                        : "bg-white border-gray-100 text-gray-400 opacity-70"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                                        }`}>
                                        <span className="text-[10px] uppercase font-bold">{format(date, 'EEE', { locale: vi })}</span>
                                        <span className="text-lg font-bold leading-none">{format(date, 'dd')}</span>
                                    </div>
                                    <div>
                                        <p className={`font-bold ${isSelected ? "text-slate-800" : "text-gray-400"}`}>
                                            Tháng {format(date, 'MM')}
                                        </p>
                                        {isSelected && (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Clock className="w-3 h-3 text-blue-500" />
                                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                    {schedule.shift === 'CA_NGAY' ? 'Cả ngày' : schedule.shift}
                                                </span>
                                                {schedule.status && (
                                                    <Badge variant="outline" className="text-[10px] py-0 h-4 border-emerald-200 text-emerald-600 bg-emerald-50">
                                                        {schedule.status === 'DA_DUYET' ? 'Đã duyệt' : 'Chờ duyệt'}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isSelected ? (
                                    <CheckCircle2 className="text-blue-600 w-6 h-6" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-200" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
