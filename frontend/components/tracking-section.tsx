"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Package, MapPin, Clock, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export function TrackingSection() {
  const [trackingNumber, setTrackingNumber] = useState("")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="theo-doi" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Theo dõi đơn hàng của bạn</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Nhập mã vận đơn để kiểm tra trạng thái và vị trí đơn hàng real-time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="max-w-2xl mx-auto p-6 md:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nhập mã vận đơn (VD: VL123456789)"
                  className="pl-10 h-12 text-base"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="h-12 px-8">
                  Tra cứu
                </Button>
              </motion.div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-8 pt-8 border-t border-border"
            >
              <div className="grid gap-6 md:grid-cols-4">
                <motion.div variants={itemVariants} className="flex flex-col items-center text-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10"
                  >
                    <Package className="h-6 w-6 text-secondary" />
                  </motion.div>
                  <p className="text-sm font-medium">Đã nhận hàng</p>
                  <p className="text-xs text-muted-foreground">15:30 - 16/12</p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col items-center text-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10"
                  >
                    <MapPin className="h-6 w-6 text-secondary" />
                  </motion.div>
                  <p className="text-sm font-medium">Đang vận chuyển</p>
                  <p className="text-xs text-muted-foreground">08:20 - 17/12</p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col items-center text-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
                  >
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </motion.div>
                  <p className="text-sm font-medium text-muted-foreground">Đang giao</p>
                  <p className="text-xs text-muted-foreground">Dự kiến 18/12</p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col items-center text-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
                  >
                    <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                  </motion.div>
                  <p className="text-sm font-medium text-muted-foreground">Hoàn thành</p>
                  <p className="text-xs text-muted-foreground">-</p>
                </motion.div>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
