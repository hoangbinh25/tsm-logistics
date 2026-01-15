"use client"
import { useEffect, useState } from "react"
import { MapPin, Navigation, Package, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

export default function DriverDashboard() {
  const { http } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Bạn cần tạo API backend: GET /orders/my-tasks
    const fetchTasks = async () => {
      try {
        const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/orders/my-tasks`) 
        if(res.ok) {
            const data = await res.json()
            setTasks(data.data || [])
        }
      } catch (e) { console.error(e) } 
      finally { setLoading(false) }
    }
    fetchTasks()
  }, [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-end mb-2">
         <h2 className="text-xl font-bold text-slate-800">Công việc hôm nay</h2>
         <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString('vi-VN')}</span>
      </div>

      {loading ? <div className="text-center py-10">Đang tải...</div> : (
        tasks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Chưa có đơn hàng nào được giao</div>
        ) : (
            tasks.map(task => (
                <div key={task.id} className="border rounded-xl p-4 shadow-sm bg-white space-y-3">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className="font-mono text-blue-600 border-blue-200">
                            {task.ma_don_hang}
                        </Badge>
                        <Badge className={
                            task.trang_thai_don_hang === 'DA_PHAN_CONG' ? 'bg-orange-500' : 'bg-blue-600'
                        }>
                            {task.trang_thai_don_hang === 'DA_PHAN_CONG' ? 'Chờ lấy hàng' : 'Đang giao'}
                        </Badge>
                    </div>

                    <div className="space-y-3 relative pl-4 border-l-2 border-dashed border-gray-200 ml-1">
                        <div className="relative">
                            <div className="absolute -left-5.25 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                            <p className="text-xs text-gray-500">Lấy hàng</p>
                            <p className="font-medium text-sm line-clamp-1">{task.kho_gui?.dia_chi || "Kho trung tâm"}</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-5.25 top-1 w-3 h-3 rounded-full bg-red-500 ring-4 ring-white" />
                            <p className="text-xs text-gray-500">Giao hàng</p>
                            <p className="font-medium text-sm line-clamp-1">{task.dia_chi_nhan}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t mt-2">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href={`/driver/orders/${task.id}`}>
                                <Navigation className="w-4 h-4 mr-2" /> Bắt đầu
                            </Link>
                        </Button>
                    </div>
                </div>
            ))
        )
      )}
    </div>
  )
}