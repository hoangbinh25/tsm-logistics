"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown, LogOut, Settings, User } from "lucide-react"
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

export function AdminHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm vận đơn, tài xế, khách hàng..."
            className="pl-9 bg-muted/50 border-none h-9 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Admin Dropdown */}
      <div className="flex items-center gap-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3 hover:bg-muted">
                {user.anh_dai_dien ? (
                  <img
                    src={user.anh_dai_dien}
                    alt={user.ho_ten}
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{user.ho_ten}</span>
                  <span className="text-xs text-muted-foreground">Quản trị viên</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản quản trị</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Menu khác với User thường */}
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Cài đặt hệ thống
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Hồ sơ cá nhân
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout} 
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}