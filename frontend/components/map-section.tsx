"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

interface WarehouseItem {
    id: string;
    ma_kho: string;
    ten_kho: string;
    dia_chi: string;
    phuong_xa: string;
    quan_huyen: string;
    tinh_thanh: string;
    loai_kho: string; // 'KHO_TRUNG_TAM' | 'KHO_TRUNG_CHUYEN'
    so_dien_thoai?: string;
}

const getMapUrl = (address: string) => {
  const encoded = encodeURIComponent(address);
  return `https://maps.google.com/maps?q=${encoded}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

export function MapSection({ data }: { data: WarehouseItem[] }) {
  
  const [selectedLocation, setSelectedLocation] = useState(0)

  const centralWarehouses = (data || []).filter(
    item => item.loai_kho === 'KHO_CHINH' || item.ten_kho.toLowerCase()
  );

  const locations = centralWarehouses.map(kho => {
      const fullAddress = `${kho.dia_chi}, ${kho.phuong_xa}, ${kho.quan_huyen}, ${kho.tinh_thanh}`;
      return {
          city: kho.tinh_thanh,
          name: kho.ten_kho,
          address: fullAddress,
          phone: kho.so_dien_thoai || "0896315601",
          email: "hpbinh200x@gmail.com",
          hours: "8:00 - 21:00 (T2-CN)",
          mapUrl: getMapUrl(fullAddress) 
      }
  });
  if (locations.length === 0) return null;

  return (
    <section id="vi-tri" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Hệ thống chi nhánh</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Mạng lưới chi nhánh rộng khắp cả nước, sẵn sàng phục vụ bạn
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 h-full ${
                  selectedLocation === index ? "border-primary border-2 shadow-lg" : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedLocation(index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{location.city}</h3>
                      <p className="text-sm text-muted-foreground">{location.address}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <span>{location.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <span className="break-all">{location.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span>{location.hours}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-xl overflow-hidden shadow-2xl border-2"
        >
          <div className="aspect-video w-full">
            <iframe
              key={selectedLocation}
              src={locations[selectedLocation].mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
