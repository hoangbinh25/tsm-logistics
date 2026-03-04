"use client"

import { usePathname, useRouter } from "next/navigation"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react"

// 1. Interface
interface User {
  id: string
  ho_ten: string
  email: string
  anh_dai_dien?: string
  so_dien_thoai?: string | null
  dia_chi?: string | null
  vai_tro?: string
  roles?: string[]
}

interface AuthContextType {
  user: User | null
  login: (userData: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  isLoading: boolean
  updateProfile: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // 1. RESTORE SESSION (Khi F5 trang)
  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedToken = sessionStorage.getItem("accessToken")
        const storedUser = sessionStorage.getItem("user")

        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Lỗi khôi phục phiên:", error)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  // 2. LOGIN (Lưu Token)
  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData)

    // Lưu vào sessionStorage để hỗ trợ đăng nhập nhiều ID khác nhau trên nhiều tab khác nhau
    sessionStorage.setItem("accessToken", accessToken)
    sessionStorage.setItem("user", JSON.stringify(userData))
    sessionStorage.setItem("refreshToken", refreshToken)
  }

  // 3. LOGOUT (Xóa phiên hiện tại)
  const logout = useCallback(() => {
    sessionStorage.removeItem("accessToken")
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("refreshToken")

    setUser(null)
    window.location.href = "/login"
  }, [])

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...data }
      setUser(newUser)
      sessionStorage.setItem("user", JSON.stringify(newUser))
    }
  }



  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}