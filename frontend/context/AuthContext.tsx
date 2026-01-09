"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

// 1. Định nghĩa lại các Interface (Type)
interface User {
  id: string
  ho_ten: string
  email: string
  anh_dai_dien?: string
  so_dien_thoai?: string | null
  dia_chi?: string | null
  vai_tro?: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  isLoading: boolean
  updateProfile: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 2. Component Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if(storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error: any) {
        console.error("Lỗi khôi phục phiên đăng nhập:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, [])

  const updateProfile = (data: Partial<User>) => {
    if(user) {
      const newUser = { ...user, ...data }

      setUser(newUser)

      localStorage.setItem("user", JSON.stringify(newUser))
    }
  }

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
  }

  const logout = () => {
    setUser(null)
    localStorage.clear()
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading , updateProfile}}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}