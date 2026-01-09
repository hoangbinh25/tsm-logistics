"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User as UserIcon, LogOut, ChevronDown, PlusCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Package } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {user, logout} = useAuth()

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"
            >
              <Package className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-bold text-foreground">VietLogistics</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "#dich-vu", label: "Dịch vụ" },
              { href: "#tinh-nang", label: "Tính năng" },
              { href: "#theo-doi", label: "Theo dõi đơn hàng" },
              { href: "#lien-he", label: "Liên hệ" },
            ].map((link) => (
              <motion.div key={link.href} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

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

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-border/40">
                <nav className="flex flex-col gap-4">
                  {[
                    { href: "#dich-vu", label: "Dịch vụ" },
                    { href: "#tinh-nang", label: "Tính năng" },
                    { href: "#theo-doi", label: "Theo dõi đơn hàng" },
                    { href: "#lien-he", label: "Liên hệ" },
                  ].map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
                    <Button variant="ghost" asChild className="w-full">
                      <Link href="/login">Đăng nhập</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/register">Đăng ký</Link>
                    </Button>
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
