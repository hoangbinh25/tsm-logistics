"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, CreditCard, Activity, TrendingUp, Calendar, Download 
} from "lucide-react"
import { useState, useEffect } from "react"
// Import Recharts
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts'
import { useAuth } from "@/context/AuthContext"

// Helper format tiền Việt
const formatVND = (value: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function RevenuePage() {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { http } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/revenue`)
        if (res.ok) {
            const result = await res.json()
            setData(result)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) return <div className="p-8">Đang tải báo cáo...</div>
  if (!data) return <div className="p-8">Không có dữ liệu.</div>

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo Doanh thu</h1>
          <p className="text-sm text-muted-foreground">Tổng hợp hiệu quả kinh doanh từ các đơn hàng đã giao</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Calendar className="w-4 h-4"/> Chọn tháng</Button>
            <Button className="gap-2"><Download className="w-4 h-4"/> Xuất báo cáo</Button>
        </div>
      </div>

      {/* 1. CARDS THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Doanh thu tổng */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{formatVND(data.revenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">+20.1% so với tháng trước</p>
            </CardContent>
        </Card>

        {/* Đơn hoàn thành */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đơn thành công</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{data.orders.completed}</div>
                <p className="text-xs text-muted-foreground mt-1">Tỷ lệ giao: {((data.orders.completed/data.orders.total)*100).toFixed(1)}%</p>
            </CardContent>
        </Card>

        {/* Đơn hủy */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đơn đã hủy</CardTitle>
                <Activity className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-500">{data.orders.cancelled}</div>
                <p className="text-xs text-muted-foreground mt-1">Cần tối ưu quy trình</p>
            </CardContent>
        </Card>

        {/* Tổng đơn */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data.orders.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Vận đơn toàn hệ thống</p>
            </CardContent>
        </Card>
      </div>

      {/* 2. BIỂU ĐỒ DOANH THU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Biểu đồ cột (Chiếm 2 phần) */}
         <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Biểu đồ doanh thu 6 tháng gần nhất</CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.chart}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <YAxis 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => `${value / 1000000}M`} 
                            />
                            <Tooltip 
                                formatter={(value: number) => formatVND(value)}
                                cursor={{fill: 'transparent'}}
                            />
                            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                {data.chart.map((entry:any, index:number) => (
                                    <Cell key={`cell-${index}`} fill={index === data.chart.length - 1 ? "#2563eb" : "#94a3b8"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
         </Card>

         {/* Thông tin phụ (Chiếm 1 phần) */}
         <Card>
            <CardHeader><CardTitle>Phân tích nhanh</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Trung bình đơn</p>
                        <p className="text-sm text-muted-foreground">
                            {data.orders.completed > 0 
                                ? formatVND(data.revenue / data.orders.completed) 
                                : "0 ₫"} / đơn
                        </p>
                    </div>
                    <div className="ml-auto font-medium text-emerald-600">+12%</div>
                </div>
                <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Lợi nhuận ước tính</p>
                        <p className="text-sm text-muted-foreground">
                            (Giả định 20% biên độ)
                        </p>
                    </div>
                    <div className="ml-auto font-medium">{formatVND(data.revenue * 0.2)}</div>
                </div>
                
                <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3">Top Kho hiệu quả</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Kho Hà Nội</span>
                            <span className="font-bold">45%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-[45%]" />
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Kho HCM</span>
                            <span className="font-bold">32%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[32%]" />
                        </div>
                    </div>
                </div>
            </CardContent>
         </Card>
      </div>
    </main>
  )
}