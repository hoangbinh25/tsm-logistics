"use client"

import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ShippingStatsProps {
  chartData: any[];
  fleetStats: {
    moving: number;
    available: number;
    maintenance: number;
    broken: number;
    total: number;
  };
}

export function ShippingStats({ chartData, fleetStats }: ShippingStatsProps) {
  const fleetDistribution = [
    { label: "Đang di chuyển", value: fleetStats.moving, color: "bg-primary" },
    { label: "Sẵn sàng", value: fleetStats.available, color: "bg-emerald-500" },
    { label: "Bảo trì/Hỏng", value: fleetStats.maintenance + fleetStats.broken, color: "bg-destructive" },
  ];

  const calculatePercentage = (val: number) => {
    if (!fleetStats.total) return 0;
    return Math.round((val / fleetStats.total) * 100);
  };

  const performancePercent = calculatePercentage(fleetStats.moving + fleetStats.available);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6 bg-card border-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Lưu lượng vận chuyển (7 ngày)</p>
            <h3 className="text-2xl font-bold">Tổng đơn gần đây</h3>
          </div>
        </div>
        <div className="h-50 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="time" fontSize={10} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: "white", borderRadius: "8px" }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#colorOrders)"
                strokeWidth={2}
                name="Số đơn"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Hiệu suất đội xe</p>
            <h3 className="text-2xl font-bold">{performancePercent}%</h3>
          </div>
          <span className="text-xs text-muted-foreground">Thời gian thực</span>
        </div>
        <div className="space-y-4">
          {fleetDistribution.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{calculatePercentage(item.value)}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", item.color)} style={{ width: `${calculatePercentage(item.value)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
