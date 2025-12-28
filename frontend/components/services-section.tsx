"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Truck, Package, Clock, Shield, MapPin, Headphones } from "lucide-react"
import { motion } from "framer-motion"

const services = [
  {
    icon: Truck,
    title: "Vận chuyển nội địa",
    description: "Giao hàng nhanh chóng trong 24-48h trên toàn quốc với đội xe đa dạng",
  },
  {
    icon: Package,
    title: "Giao hàng COD",
    description: "Thu hộ tiền, đối soát tự động và chuyển khoản nhanh chóng cho người bán",
  },
  {
    icon: Clock,
    title: "Giao hàng theo giờ",
    description: "Cam kết giao đúng giờ với dịch vụ priority express trong ngày",
  },
  {
    icon: Shield,
    title: "Bảo hiểm hàng hóa",
    description: "Đảm bảo an toàn 100% với dịch vụ bảo hiểm toàn diện",
  },
  {
    icon: MapPin,
    title: "Phủ sóng toàn quốc",
    description: "Mạng lưới vận chuyển rộng khắp 63 tỉnh thành Việt Nam",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ tư vấn chuyên nghiệp luôn sẵn sàng hỗ trợ mọi lúc",
  },
]

export function ServicesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="dich-vu" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Dịch vụ vận chuyển nội địa</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Giải pháp logistics chuyên nghiệp phủ sóng toàn quốc cho doanh nghiệp Việt
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 h-full">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4"
                  >
                    <service.icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-pretty">{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
