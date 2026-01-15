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
  http: (url: string, options?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // HELPER: Xác định Key lưu Storage dựa trên URL hiện tại
  const getStorageKeys = useCallback(() => {
    // Mặc định là User
    let tokenKey = "token_user"
    let userKey = "user_info_user"

    if (pathname?.startsWith("/admin")) {
      tokenKey = "token_admin"
      userKey = "user_info_admin"
    } else if (pathname?.startsWith("/driver")) {
      tokenKey = "token_driver"
      userKey = "user_info_driver"
    }

    return { tokenKey, userKey }
  }, [pathname])

  // 1. RESTORE SESSION (Khi F5 trang)
  useEffect(() => {
    const restoreSession = () => {
      try {
        const { tokenKey, userKey } = getStorageKeys() // Lấy key dựa theo trang đang đứng
        
        const storedToken = localStorage.getItem(tokenKey)
        const storedUser = localStorage.getItem(userKey)

        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          // Nếu đang ở trang Admin mà không có token admin -> user = null
          setUser(null)
        }
      } catch (error) {
        console.error("Lỗi khôi phục phiên:", error)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [getStorageKeys])

  // 2. LOGIN (Lưu Token)
   const login = (userData: User, accessToken: string, refreshToken: string) => {
     setUser(userData)

    // 1. LUÔN LUÔN lưu token User (Quan trọng nhất để không bị logout ở trang Client)
    localStorage.setItem("token_user", accessToken)
    localStorage.setItem("user_info_user", JSON.stringify(userData))

    // 2. Lưu THÊM token cho các vai trò đặc biệt
   const role = userData.vai_tro;
     if (role === 'QUAN_LY' || role === 'ADMIN') {
        // Nếu là Quản lý: Lưu thêm vào kho Admin
       localStorage.setItem("token_admin", accessToken);
       localStorage.setItem("user_info_admin", JSON.stringify(userData));
    } 
    else if (role === 'TAI_XE' || role === 'DRIVER') {
        // Nếu là Tài xế: Lưu thêm vào kho Driver
         localStorage.setItem("token_driver", accessToken);
         localStorage.setItem("user_info_driver", JSON.stringify(userData));
     }

    // Lưu refreshToken 
    localStorage.setItem("refreshToken", refreshToken)
}

  // 3. LOGOUT (Chỉ xóa ngăn hiện tại)
  const logout = useCallback(() => {
    const { tokenKey, userKey } = getStorageKeys()
    
    // Chỉ xóa token của phiên hiện tại (Không dùng localStorage.clear())
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userKey)
    
    setUser(null)
    window.location.href = "/login"
  }, [getStorageKeys])

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...data }
      setUser(newUser)
      const { userKey } = getStorageKeys()
      localStorage.setItem(userKey, JSON.stringify(newUser))
    }
  }

  // 4. HTTP WRAPPER (Tự động lấy đúng Token để gửi)
  const http = async (url: string, options: RequestInit = {}) => {
    // Lấy token dựa trên trang hiện tại đang đứng (Admin lấy token Admin, Driver lấy token Driver)
    const { tokenKey } = getStorageKeys()
    const token = localStorage.getItem(tokenKey)

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    } as HeadersInit

    try {
      const response = await fetch(url, { ...options, headers })

      if (response.status === 401) {
        // Nếu lỗi 401 -> Chỉ logout phiên hiện tại
        logout()
        return Promise.reject("Phiên đăng nhập hết hạn")
      }

      return response
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateProfile, http }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}