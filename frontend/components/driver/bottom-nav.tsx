"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ListChecks, User, Bell } from "lucide-react"

export function DriverBottomNav() {
  const pathname = usePathname()
  
  const navs = [
    { href: "/driver", label: "Trang chủ", icon: Home },
    { href: "/driver/history", label: "Lịch sử", icon: ListChecks },
    { href: "/driver/notifications", label: "Thông báo", icon: Bell },
    { href: "/driver/profile", label: "Tài khoản", icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around z-50 md:max-w-md md:mx-auto">
      {navs.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 ${isActive ? "text-blue-600" : "text-gray-400"}`}>
            <item.icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}