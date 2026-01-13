"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Truck, Package, Clock } from "lucide-react" 

// Helper chọn icon dựa trên loại dịch vụ (Optional)
const getIcon = (code: string) => {
    if (code.includes("HOA-TOC")) return <Clock className="w-10 h-10 text-primary mb-4" />
    if (code.includes("BAC-NAM")) return <Truck className="w-10 h-10 text-primary mb-4" />
    return <Package className="w-10 h-10 text-primary mb-4" />
}

// Helper format tiền
const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

interface ServiceItem {
    id: string;
    ma_dich_vu: string;
    ten_dich_vu: string;
    mo_ta: string;
    gia_co_ban: number;
    don_vi_tinh: string;
}

export function ServicesSection({ data }: { data: ServiceItem[] }) {
  const services = data || [];

  return (
    <section className="py-16 bg-slate-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Dịch vụ vận chuyển nội địa</h2>
            <p className="mx-auto mt-4 max-w-175 text-gray-500 md:text-xl">
                Đa dạng giải pháp vận tải đáp ứng mọi nhu cầu của bạn
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {services.length > 0 ? (
            services.map((service) => (
              <Card 
                key={service.id}
                className="hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
                <CardHeader>
                  <div className="flex justify-center">{getIcon(service.ma_dich_vu)}</div>
                  <CardTitle className="text-xl text-center">{service.ten_dich_vu}</CardTitle>
                </CardHeader>
              
                <CardContent className="text-center flex-1 flex flex-col">
                  <CardDescription className="mb-6">
                    {service.mo_ta}
                  </CardDescription>
                
                  <div className="mt-auto pt-4 border-t border-dashed">
                     <span className="text-muted-foreground text-sm block mb-1">Cước phí ước tính</span>
                     <div className="font-bold text-lg text-primary">
                        {formatVND(Number(service.gia_co_ban))} / {service.don_vi_tinh}
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
             <p className="text-center col-span-3 text-muted-foreground">Đang cập nhật dịch vụ...</p>
          )}
        </div>
      </div>
    </section>
  )
}