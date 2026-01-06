"use client"

import { LayoutDashboard, Truck, MapPin, BarChart3, Settings, ShieldCheck, Box, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { id: "fleet", icon: Truck, label: "Đội xe" },
  { id: "routes", icon: MapPin, label: "Lộ trình" },
  { id: "orders", icon: Box, label: "Đơn hàng" },
  { id: "revenue", icon: BarChart3, label: "Doanh thu" },
  { id: "insurance", icon: ShieldCheck, label: "Bảo hiểm" },
  { id: "staff", icon: User, label: "Nhân sự" },
  { id: "settings", icon: Settings, label: "Cài đặt" },
]

interface ShippingNavProps {
  activeTab: string
  onTabChange: (id: string) => void
}

export function ShippingNav({ activeTab, onTabChange }: ShippingNavProps) {
  return (
    <div className="w-64 border-r border-border h-screen p-4 flex flex-col gap-6 bg-background shrink-0">
      <div className="flex items-center gap-2 px-2">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">VậnTảiVN</span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase font-bold text-muted-foreground px-2 mb-2 tracking-widest">Quản lý</p>
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full text-left",
              activeTab === item.id
                ? "bg-accent text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase font-bold text-muted-foreground px-2 mb-2 tracking-widest">Hệ thống</p>
        {navItems.slice(5).map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full text-left",
              activeTab === item.id
                ? "bg-accent text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
