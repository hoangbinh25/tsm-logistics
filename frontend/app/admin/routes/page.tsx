"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

// Import MapComponent dạng Dynamic để tránh lỗi SSR "window is not defined"
const MapWithNoSSR = dynamic(() => import("@/components/admin/map-component"), {
  ssr: false,
  loading: () => <div className="h-150 w-full bg-muted animate-pulse flex items-center justify-center">Đang tải bản đồ...</div>
})

// Dữ liệu giả lập các tuyến đường
const initialRoutes = [
  {
    id: "TRIP-001",
    bien_kiem_soat: "29C-123.45",
    driver: "Nguyễn Văn A",
    origin: "Hà Nội",
    dest: "Đà Nẵng",
    startPos: [21.0285, 105.8542], // Hà Nội
    endPos: [16.0544, 108.2022],   // Đà Nẵng
    currentPos: [21.0285, 105.8542], // Ban đầu ở HN
    progress: 0, // 0% -> 100%
    speed: 65,
    color: "red"
  },
  {
    id: "TRIP-002",
    bien_kiem_soat: "51D-999.88",
    driver: "Trần Thị B",
    origin: "TP.HCM",
    dest: "Cần Thơ",
    startPos: [10.8231, 106.6297], // HCM
    endPos: [10.0452, 105.7469],   // Cần Thơ
    currentPos: [10.8231, 106.6297],
    progress: 50, // Đang đi được một nửa
    speed: 55,
    color: "blue"
  }
]

export default function RoutesPage() {
  const [vehicles, setVehicles] = useState<any[]>(initialRoutes)
  const [filter, setFilter] = useState("ALL")

  // --- LOGIC MÔ PHỎNG DI CHUYỂN ---
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(v => {
          // Nếu đã đến nơi (progress >= 100) thì reset về 0 để chạy lại (demo vòng lặp)
          let newProgress = v.progress + 0.5; // Mỗi lần tăng 0.5% quãng đường
          if (newProgress > 100) newProgress = 0;

          // Tính toán tọa độ mới dựa trên % quãng đường (Linear Interpolation)
          const lat = v.startPos[0] + (v.endPos[0] - v.startPos[0]) * (newProgress / 100);
          const lng = v.startPos[1] + (v.endPos[1] - v.startPos[1]) * (newProgress / 100);

          return {
            ...v,
            progress: newProgress,
            currentPos: [lat, lng]
          };
        })
      })
    }, 100); // Cập nhật mỗi 100ms (10 khung hình/giây)

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-1 p-6 space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Giám sát Lộ trình</h1>
          <p className="text-sm text-muted-foreground">Theo dõi trực tuyến {vehicles.length} phương tiện đang di chuyển</p>
        </div>
        <div className="w-50">
           <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger><SelectValue placeholder="Lọc khu vực" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">Tất cả khu vực</SelectItem>
                    <SelectItem value="MB">Miền Bắc</SelectItem>
                    <SelectItem value="MN">Miền Nam</SelectItem>
                </SelectContent>
           </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Cột trái: Danh sách xe */}
        <Card className="lg:col-span-1 overflow-y-auto p-4 space-y-4 h-full">
            {vehicles.map(v => (
                <div key={v.id} className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-primary">{v.bien_kiem_soat}</span>
                        <Badge variant={v.speed > 60 ? "destructive" : "default"} className="text-[10px]">
                            {v.speed} km/h
                        </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tài xế:</span>
                            <span>{v.driver}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Lộ trình:</span>
                            <span>{v.origin} → {v.dest}</span>
                        </div>
                        <div className="mt-2">
                             <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Tiến độ</span>
                                <span>{Math.round(v.progress)}%</span>
                             </div>
                             <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 transition-all duration-300" 
                                    style={{ width: `${v.progress}%` }} 
                                />
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </Card>

        {/* Cột phải: Bản đồ */}
        <div className="lg:col-span-2 h-full min-h-125 rounded-xl overflow-hidden border shadow-sm relative z-0">
            <MapWithNoSSR vehicles={vehicles} />
        </div>
      </div>
    </main>
  )
}