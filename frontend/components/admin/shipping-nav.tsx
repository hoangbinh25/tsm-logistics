"use client"

import { 
  LayoutDashboard, Truck, Map, Package, BarChart3, Warehouse, Settings, 
  Container
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation" // Dùng hook này để biết đang ở trang nào

export function ShippingNav() {
  const pathname = usePathname() // Lấy đường dẫn hiện tại

  const navItems = [
    { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
    { href: "/admin/fleet", label: "Đội xe", icon: Truck },
    { href: "/admin/warehouse", label: "Kho bãi", icon: Warehouse },
    { href: "/admin/orders", label: "Đơn hàng", icon: Package },
    { href: "/admin/routes", label: "Lộ trình", icon: Map },
    { href: "/admin/revenue", label: "Doanh thu", icon: BarChart3 },
    { href: "/admin/services", label: "Dịch vụ vận chuyển", icon: Container }
  ]

  return (
    <nav className="w-64 border-r border-border bg-card/50 hidden md:flex flex-col h-full shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl text-primary mb-6">
          <Truck className="h-6 w-6" />
          <span>TSM Admin</span>
        </div>
        
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/admin" 
              ? pathname === "/admin" 
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
      
      <div className="mt-auto p-6 border-t border-border">
         <div className="flex items-center gap-3 text-muted-foreground text-sm">
             <Settings className="w-4 h-4" /> Cài đặt hệ thống
         </div>
      </div>
    </nav>
  )
}