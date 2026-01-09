"use client"

import { ShippingNav } from "@/components/admin/shipping-nav" 
import { ShippingStats } from "@/components/admin/shipping-stats"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, Filter, MoreHorizontal, Truck, MapPin, UserIcon, ChevronDown, LogOut } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

const activeShipments = [
  { id: "VN-8829", status: "Đang vận chuyển", origin: "Hà Nội", dest: "Đà Nẵng", eta: "14:30", driver: "Nguyễn Văn A" },
  { id: "VN-9012", status: "Chuẩn bị", origin: "TP.HCM", dest: "Cần Thơ", eta: "16:45", driver: "Trần Thị B" },
  { id: "VN-7731", status: "Đã giao", origin: "Hải Phòng", dest: "Quảng Ninh", eta: "Đã đến", driver: "Lê Văn C" },
  { id: "VN-5542", status: "Đang vận chuyển", origin: "Vinh", dest: "Huế", eta: "19:00", driver: "Phạm Văn D" },
]

const FleetView = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card border border-border p-4 rounded-xl space-y-3">
          <div className="h-40 bg-muted/50 rounded-lg flex items-center justify-center">
            <Truck className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <div>
            <h3 className="font-bold">Xe tải Hino 500 - 29C-123.4{i}</h3>
            <p className="text-sm text-muted-foreground">Tài xế: Nguyễn Văn {i}</p>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded">Sẵn sàng</span>
            <span className="text-muted-foreground">Odometer: 12,400 km</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const MapPlaceholder = () => (
  <div className="h-[600px] bg-muted/30 rounded-xl border border-dashed border-border flex items-center justify-center flex-col gap-4">
    <MapPin className="w-12 h-12 text-primary/40 animate-bounce" />
    <div className="text-center">
      <p className="font-medium">Đang tải bản đồ vệ tinh...</p>
      <p className="text-sm text-muted-foreground text-pretty">Theo dõi 12 phương tiện đang di chuyển trực tuyến</p>
    </div>
  </div>
)

export default function ShippingDashboard() {
  const {user, logout, isLoading} = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const router = useRouter()

  useEffect(() => {
    if(!isLoading) {
      console.log("Current User", user);
      console.log("Vai tro: ", user?.vai_tro);
      if(!user) {
        router.push("/login")
      } else if(user.vai_tro !== "QUAN_LY") {
        router.push("/")
      }
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.vai_tro !== "QUAN_LY") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm mã vận đơn, tài xế..."
                className="pl-9 bg-muted/50 border-none h-9 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              // === TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP ===
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3 ">
                    {user?.anh_dai_dien ? (
                      <img 
                        src={user.anh_dai_dien}
                        alt={user.ho_ten || "Avatar"}
                        className="h-8 w-8 rounded-full object-cover border border-gray-200"
                        />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <UserIcon className="h-4 w-4 text-primary" />
                    </div>
                    )}
                    
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{user.ho_ten || "Người dùng"}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Hồ sơ cá nhân</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                      {/* <PlusCircle className="mr-2 h-4 w-4" /> */}
                      <Link href="/orders/create">Tạo đơn hàng mới</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">Đơn hàng của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout} 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // === TRƯỜNG HỢP CHƯA ĐĂNG NHẬP===
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild>
                    <Link href="/register">Đăng ký</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <Suspense fallback={null}>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {activeTab === "dashboard" && "Điều phối vận chuyển"}
                  {activeTab === "fleet" && "Quản lý đội xe"}
                  {activeTab === "routes" && "Giám sát lộ trình"}
                  {/* Placeholder for other tabs */}
                  {activeTab === "orders" && "Danh sách đơn hàng"}
                  {activeTab === "revenue" && "Báo cáo doanh thu"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "dashboard" && "Theo dõi lộ trình nội địa thời gian thực"}
                  {activeTab === "fleet" && "Quản lý 42 phương tiện trong hệ thống"}
                  {activeTab === "routes" && "Định vị GPS và tối ưu hóa đường đi"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Filter className="w-4 h-4" /> Lọc
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  {activeTab === "fleet" ? "+ Thêm xe mới" : "+ Tạo đơn mới"}
                </Button>
              </div>
            </div>

            {activeTab === "dashboard" && (
              <>
                <ShippingStats />
                {/* Table Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex bg-muted p-1 rounded-md">
                      <Button size="sm" variant="ghost" className="bg-background shadow-sm h-7 text-xs px-3">
                        Tất cả
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-3 text-muted-foreground">
                        Đang đi
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-3 text-muted-foreground">
                        Sắp đến
                      </Button>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg overflow-hidden bg-card">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                        <tr>
                          <th className="px-6 py-4 font-medium">Mã vận đơn</th>
                          <th className="px-6 py-4 font-medium">Trạng thái</th>
                          <th className="px-6 py-4 font-medium">Lộ trình</th>
                          <th className="px-6 py-4 font-medium">Dự kiến (ETA)</th>
                          <th className="px-6 py-4 font-medium">Tài xế</th>
                          <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {activeShipments.map((ship) => (
                          <tr key={ship.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4 font-mono text-primary">{ship.id}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  ship.status === "Đã giao"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : ship.status === "Chuẩn bị"
                                      ? "bg-amber-500/10 text-amber-500"
                                      : "bg-primary/10 text-primary"
                                }`}
                              >
                                {ship.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span>{ship.origin}</span>
                                <span className="text-muted-foreground">→</span>
                                <span>{ship.dest}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{ship.eta}</td>
                            <td className="px-6 py-4">{ship.driver}</td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === "fleet" && <FleetView />}
            {activeTab === "routes" && <MapPlaceholder />}
            {/* Placeholder for other tabs */}
            {!["dashboard", "fleet", "routes"].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-xl border-border text-muted-foreground">
                <p>Giao diện {activeTab} đang được phát triển</p>
              </div>
            )}
          </div>
        </Suspense>
      </main>
    </div>
  )
}
