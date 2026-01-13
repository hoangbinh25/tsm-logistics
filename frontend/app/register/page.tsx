"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Package, ArrowLeft, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { isValidVNMobile, isValidVNPhone } from "@/utils/validatePhoneNumber"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [touched, setTouched] = useState({ phone: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched((prev) => ({ ...prev, phone: true }))
    if (!isPasswordMatch || !isPhoneOK) return

    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ho_ten: formData.fullName,
          so_dien_thoai: formData.phone,
          email: formData.email,
          mat_khau: formData.password,
          xac_nhan_mat_khau: formData.confirmPassword
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Đăng ký thất bại")

      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng đăng nhập để tiếp tục",
      })
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Lỗi đăng ký",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Validate phone number
  const isPhoneOK = isValidVNPhone(formData.phone);
  const phoneError = touched.phone && formData.phone.length > 0 && !isValidVNMobile(formData.phone) ? "Số điện thoại không hợp lệ (VN: 03/05/07/08/09, đủ 10 số hoặc +84...)" : ""

  // Requiment password
  const passwordRequirements = [
    { label: "Ít nhất 8 ký tự", met: formData.password.length >= 8 },
    { label: "Có chữ hoa và chữ thường", met: /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) },
    { label: "Có ít nhất 1 số", met: /\d/.test(formData.password) },
  ]

  // Requiment confirm password
  const isPasswordMatch = formData.password.length > 0 && formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword

  const confirmPasswordRequirements = [
    { label: "Mật khẩu phải giống nhau", met: isPasswordMatch },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-background to-secondary/5 p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Link>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mb-4"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Đăng ký tài khoản</h1>
          <p className="text-muted-foreground">Tạo tài khoản để sử dụng dịch vụ của chúng tôi</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Thông tin đăng ký</CardTitle>
            <CardDescription>Vui lòng điền đầy đủ thông tin bên dưới</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    aria-invalid={!!phoneError}
                    required
                    className={`h-11 ${phoneError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {phoneError && (
                    <p className="text-xs text-destructive">{phoneError}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your pass word"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Enter your confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {confirmPasswordRequirements.map((req, idx) => (
                      <li key={idx}
                        className={req.met ? "text-green-500" : "text-muted-foreground"}>
                        {req.met ? "✓" : "x"} {req.label}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* {formData.confirmPassword.length > 0 && !isPasswordMatch && (
                  <p className="text-sm text-destructive">Mật khẩu xác nhận không khớp</p>
                )} */}
              </div>


              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-muted/50 rounded-lg p-4 space-y-2"
                >
                  <p className="text-sm font-medium mb-2">Yêu cầu mật khẩu:</p>
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div
                        className={`h-4 w-4 rounded-full flex items-center justify-center ${req.met ? "bg-green-500" : "bg-muted"}`}
                      >
                        {req.met && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={req.met ? "text-foreground" : "text-muted-foreground"}>{req.label}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                  required
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  Tôi đồng ý với{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                size="lg"
                disabled={!isPasswordMatch || !isPhoneOK || isLoading}
                onClick={handleSubmit}>
                {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <div className="text-sm text-center text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
