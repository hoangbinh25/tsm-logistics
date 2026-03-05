"use client"

import { useState, useEffect } from "react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Cell, PieChart, Pie
} from "recharts"
import {
    Award, TrendingUp, AlertCircle, CheckCircle2,
    Clock, Package, Wallet, Star
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchWithAuth } from "@/utils/api"
import { Badge } from "@/components/ui/badge"

interface PerformanceData {
    summary: {
        totalOrders: number
        completedOrders: number
        canceledOrders: number
        onTimeOrders: number
        totalIncidents: number
        completionRate: number
        punctualityRate: number
        totalRevenue: number
        rating: number
    }
    incidentsByType: Record<string, number>
    chartData: {
        label: string
        orders: number
        completed: number
    }[]
}

export function DriverPerformance({ driverId }: { driverId: string }) {
    const [data, setData] = useState<PerformanceData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/drivers/${driverId}/performance`)
                if (res.ok) {
                    const payload = await res.json()
                    setData(payload.data)
                }
            } catch (error) {
                console.error("Lỗi tải hiệu suất:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [driverId])

    if (loading) return <div className="py-20 text-center text-muted-foreground">Đang tính toán chỉ số hiệu suất...</div>
    if (!data) return <div className="py-20 text-center text-red-500">Không thể tải dữ liệu hiệu suất.</div>

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

    const incidentColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6']
    const pieData = Object.entries(data.incidentsByType).map(([name, value]) => ({ name, value }))

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return "text-green-600"
        if (rating >= 3) return "text-yellow-600"
        return "text-red-600"
    }

    return (
        <div className="space-y-6 py-4">
            {/* Cột số liệu tổng quan */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50/50 border-blue-100 shadow-none">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Package className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase">Tổng chuyến</p>
                            <p className="text-xl font-bold text-blue-900">{data.summary.totalOrders}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green-50/50 border-green-100 shadow-none">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-bold text-green-400 uppercase">Hoàn thành</p>
                            <p className="text-xl font-bold text-green-900">{data.summary.completionRate}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-orange-50/50 border-orange-100 shadow-none">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Clock className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-bold text-orange-400 uppercase">Đúng hạn</p>
                            <p className="text-xl font-bold text-orange-900">{data.summary.punctualityRate}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-purple-50/50 border-purple-100 shadow-none">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Star className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-bold text-purple-400 uppercase">Đánh giá HQ</p>
                            <p className={`text-xl font-bold ${getRatingColor(data.summary.rating)}`}>{data.summary.rating}/5</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Biểu đồ xu hướng */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" /> Xu hướng công việc (6 tháng)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="label" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="orders" name="Tổng đơn" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="completed" name="Hoàn thành" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Biểu đồ sự cố */}
                <Card className="md:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" /> Phân loại sự cố
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.summary.totalIncidents > 0 ? (
                            <div className="h-[200px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={incidentColors[index % incidentColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-red-600">{data.summary.totalIncidents}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Sự cố</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center text-green-500 gap-2">
                                <Award className="w-10 h-10" />
                                <p className="text-xs font-bold uppercase">Tài xế an toàn</p>
                                <p className="text-[10px] text-muted-foreground italic">Không có sự cố báo cáo</p>
                            </div>
                        )}

                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded text-xs">
                                <span className="text-slate-500">Tổng doanh thu vận chuyển</span>
                                <span className="font-bold text-slate-900">{formatCurrency(data.summary.totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded text-xs">
                                <span className="text-slate-500">Tỷ lệ hủy đơn</span>
                                <span className="font-bold text-red-600">
                                    {data.summary.totalOrders > 0
                                        ? Math.round((data.summary.canceledOrders / data.summary.totalOrders) * 100)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
