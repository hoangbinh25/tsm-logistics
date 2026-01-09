"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ShippingNav } from "@/components/admin/shipping-nav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.vai_tro !== "QUAN_LY") {
        router.push("/") 
      } else {
        setIsAuthorized(true)
      }
    }
  }, [user, isLoading, router])

  // 2. Màn hình chờ khi đang check
  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Đang kiểm tra quyền quản trị...</p>
        </div>
      </div>
    )
  }

  // 3. Giao diện chung (Menu bên trái + Nội dung bên phải)
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Menu cố định bên trái */}
      <ShippingNav />
      
      {/* Khu vực nội dung thay đổi (children) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}