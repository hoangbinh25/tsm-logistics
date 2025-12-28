"use client"

import { TrendingUp, Package, MapPin, Users } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const stats = [
  {
    icon: Package,
    value: "1M+",
    label: "Đơn hàng/tháng",
  },
  {
    icon: MapPin,
    value: "63/63",
    label: "Tỉnh thành",
  },
  {
    icon: Users,
    value: "50K+",
    label: "Khách hàng",
  },
  {
    icon: TrendingUp,
    value: "99.8%",
    label: "Giao đúng hẹn",
  },
]

export function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const statVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <section ref={ref} className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={statVariants} className="flex flex-col items-center text-center gap-3">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur-sm"
              >
                <stat.icon className="h-8 w-8" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: index * 0.15 + 0.3, type: "spring", stiffness: 200 }}
                className="text-4xl md:text-5xl font-bold"
              >
                {stat.value}
              </motion.div>
              <div className="text-lg text-primary-foreground/80">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
