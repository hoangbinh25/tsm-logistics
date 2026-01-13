"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, KeyRound, Mail, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const router = useRouter()
  
  // Các bước: 1-Email, 2-OTP, 3-NewPassword
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  // Data
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Countdown Timer cho OTP
  const [countdown, setCountdown] = useState(0)

  // validate pass
  const passwordRequirements = [
    { label: "Ít nhất 8 ký tự", met: newPassword.length >= 8 },
    { label: "Có chữ hoa và chữ thường", met: /(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) },
    { label: "Có ít nhất 1 số", met: /\d/.test(newPassword) },
  ]

  const isPasswordValid = passwordRequirements.every(req => req.met)
  
  // Kiểm tra khớp mật khẩu
  const isPasswordMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  // XỬ LÝ BƯỚC 1: GỬI MAIL
  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      
      if (res.ok) {
        toast({ title: "Đã gửi mã OTP", description: "Vui lòng kiểm tra email của bạn." })
        setStep(2)
        setCountdown(60) // 1 phút
      } else {
        throw new Error(data.message || "Không thể gửi mail")
      }
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // XỬ LÝ BƯỚC 2: VERIFY OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Validate Client
    if (otp.length !== 6) {
        toast({ title: "Lỗi", description: "Mã OTP phải có 6 chữ số", variant: "destructive" })
        return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      // Đọc dữ liệu JSON trả về từ Backend 
      const data = await res.json()

      if (res.ok) {
        setStep(3)
        toast({ 
            title: "Thành công", 
            description: "Mã OTP chính xác.",
            className: "bg-green-50 text-green-900 border-green-200"
        })
      } else {
        throw new Error(data.message || "Mã OTP không hợp lệ")
      }
    } catch (error: any) {
      console.error(error)
      toast({ 
        title: "Xác thực thất bại", 
        description: error.message,
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // XỬ LÝ BƯỚC 3: ĐỔI MẬT KHẨU
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" })
      return
    }

    if (!isPasswordValid) {
        toast({ 
            title: "Mật khẩu chưa đạt chuẩn", 
            description: "Vui lòng đáp ứng đủ các yêu cầu bảo mật.", 
            variant: "destructive" 
        })
        return
    }

    if (!isPasswordMatch) {
      toast({ 
          title: "Lỗi xác nhận", 
          description: "Mật khẩu nhập lại không khớp.", 
          variant: "destructive" 
      })
      return
    }
    
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      const data = await res.json()

      if (res.ok) {
        toast({ title: "Thành công", description: "Mật khẩu đã được thay đổi. Hãy đăng nhập lại." })
        router.push("/login")
      } else {
        throw new Error(data.message || "Đổi mật khẩu thất bại")
      }
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-4">
               <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <KeyRound className="h-6 w-6 text-primary" />
               </div>
            </div>
            <CardTitle className="text-center text-2xl">Quên mật khẩu?</CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "Nhập email để nhận mã xác thực"}
              {step === 2 && `Đã gửi mã đến ${email}`}
              {step === 3 && "Thiết lập mật khẩu mới"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {/* --- BƯỚC 1: NHẬP EMAIL --- */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  onSubmit={handleSendMail}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email đăng ký</Label>
                    <div className="relative">
                       <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                       <Input 
                         id="email" type="email" placeholder="name@example.com" className="pl-9"
                         value={email} onChange={(e) => setEmail(e.target.value)} required 
                       />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                  </Button>
                </motion.form>
              )}

              {/* --- BƯỚC 2: NHẬP OTP --- */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="otp">Mã xác thực (OTP)</Label>
                    <Input 
                      id="otp" placeholder="123456" className="text-center text-lg tracking-widest" maxLength={6}
                      value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} required 
                    />
                    <div className="text-sm text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Timer className="h-3 w-3" />
                      Mã hết hạn sau: <span className="text-red-500 font-medium">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Tiếp tục</Button>
                  <Button 
                    type="button" variant="ghost" className="w-full text-xs" 
                    onClick={() => setStep(1)}
                  >
                    Gửi lại mã hoặc đổi email
                  </Button>
                </motion.form>
              )}

              {/* --- BƯỚC 3: ĐỔI PASS --- */}
              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  {/* Ô nhập mật khẩu mới */}
                  <div className="space-y-2">
                    <Label htmlFor="new-pass">Mật khẩu mới</Label>
                    <Input 
                      id="new-pass" type="password" required 
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                    />
                    
                    {/* Hiển thị danh sách yêu cầu (Realtime feedback) */}
                    <div className="space-y-1 mt-2 p-3 bg-muted/30 rounded-md border">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Yêu cầu mật khẩu:</p>
                        {passwordRequirements.map((req, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                                {req.met ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                                )}
                                <span className={req.met ? "text-green-600 transition-colors" : "text-muted-foreground transition-colors"}>
                                    {req.label}
                                </span>
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Ô nhập lại mật khẩu */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pass">Nhập lại mật khẩu</Label>
                    <Input 
                      id="confirm-pass" type="password" required 
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className={confirmPassword.length > 0 && !isPasswordMatch ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {confirmPassword.length > 0 && !isPasswordMatch && (
                        <p className="text-xs text-red-500 mt-1">Mật khẩu xác nhận chưa khớp</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="justify-center border-t pt-4">
             <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại đăng nhập
             </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}