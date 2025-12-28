"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

const locations = [
  {
    city: "Hà Nội",
    address: "Số 123, Đường Giải Phóng, Quận Hai Bà Trưng",
    phone: "024 1234 5678",
    email: "hanoi@logistics.vn",
    hours: "8:00 - 18:00 (T2-T7)",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.4967707837916!2d105.84117931533395!3d21.012461793800826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953357c995%3A0x192b1d8b6b7b6b6b!2zSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s",
  },
  {
    city: "TP. Hồ Chí Minh",
    address: "Số 456, Đường Nguyễn Văn Linh, Quận 7",
    phone: "028 9876 5432",
    email: "hcm@logistics.vn",
    hours: "8:00 - 18:00 (T2-T7)",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.6346004639464!2d106.70445431531869!3d10.762622792331764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0x5ed38408aa8b7431!2zVHAuIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s",
  },
  {
    city: "Đà Nẵng",
    address: "Số 789, Đường Nguyễn Văn Linh, Quận Thanh Khê",
    phone: "0236 3456 789",
    email: "danang@logistics.vn",
    hours: "8:00 - 18:00 (T2-T7)",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.8939922064776!2d108.21849731532682!3d16.070739888866337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219b5f2f2f2f2%3A0x5ed38408aa8b7431!2zxJDDoCBO4bq1bmc!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s",
  },
]

export function MapSection() {
  const [selectedLocation, setSelectedLocation] = useState(0)

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
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{location.city}</h3>
                      <p className="text-sm text-muted-foreground">{location.address}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{location.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="break-all">{location.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
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
          <div className="aspect-[16/9] w-full">
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
