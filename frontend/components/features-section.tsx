"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Shield, Zap, BarChart3, Bell, Users } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: MapPin,
    title: "Theo dõi Real-time",
    description: "Cập nhật vị trí và trạng thái đơn hàng liên tục với GPS tracking",
  },
  {
    icon: Shield,
    title: "Bảo hiểm toàn diện",
    description: "Bảo vệ 100% giá trị hàng hóa với chính sách bồi thường rõ ràng",
  },
  {
    icon: Zap,
    title: "Xử lý tự động",
    description: "Hệ thống AI tối ưu tuyến đường và phân loại hàng hóa tự động",
  },
  {
    icon: BarChart3,
    title: "Báo cáo chi tiết",
    description: "Dashboard analytics với insights về hiệu suất và chi phí vận chuyển",
  },
  {
    icon: Bell,
    title: "Thông báo thông minh",
    description: "Nhận thông báo qua email, SMS và app khi đơn hàng thay đổi trạng thái",
  },
  {
    icon: Users,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ chăm sóc khách hàng chuyên nghiệp sẵn sàng hỗ trợ mọi lúc",
  },
]

export function FeaturesSection() {
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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="tinh-nang" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Tính năng vượt trội</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Công nghệ hiện đại giúp trải nghiệm vận chuyển của bạn trở nên đơn giản và hiệu quả
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={cardVariants} whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
              <Card className="group hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors mb-4"
                  >
                    <feature.icon className="h-6 w-6 text-secondary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-pretty">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
