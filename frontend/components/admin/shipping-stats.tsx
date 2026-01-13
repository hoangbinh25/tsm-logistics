"use client"

import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  outgoing: Math.floor(Math.random() * 500) + 200,
  incoming: Math.floor(Math.random() * 300) + 100,
}))

export function ShippingStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6 bg-card border-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Lưu lượng vận chuyển</p>
            <h3 className="text-2xl font-bold">428 đơn/giờ</h3>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" /> <span>Xuất kho</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#f59e0b]" /> <span>Nhập kho</span>
            </div>
          </div>
        </div>
        <div className="h-50 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                itemStyle={{ color: "var(--foreground)" }}
              />
              <Area
                type="monotone"
                dataKey="outgoing"
                stroke="var(--color-primary)"
                fillOpacity={1}
                fill="url(#colorOut)"
                strokeWidth={2}
              />
              <Area type="monotone" dataKey="incoming" stroke="#f59e0b" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Hiệu suất đội xe</p>
            <h3 className="text-2xl font-bold">94.2%</h3>
          </div>
          <span className="text-xs text-muted-foreground">Thời gian thực</span>
        </div>
        <div className="space-y-4">
          {[
            { label: "Đang di chuyển", value: 85, color: "bg-primary" },
            { label: "Đang bốc xếp", value: 12, color: "bg-[#f59e0b]" },
            { label: "Bảo trì", value: 3, color: "bg-destructive" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
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
