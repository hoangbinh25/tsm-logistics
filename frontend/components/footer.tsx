"use client"

import Link from "next/link"
import { Package, Mail, Phone, MapPin, Facebook, Youtube, Linkedin } from "lucide-react"
import { motion } from "framer-motion"

export function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <footer id="lien-he" className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={columnVariants} className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"
              >
                <Package className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <span className="text-xl font-bold">VietLogistics</span>
            </Link>
            <p className="text-sm text-muted-foreground text-pretty">
              Nền tảng logistics hàng đầu Việt Nam, mang đến giải pháp vận chuyển thông minh và hiệu quả.
            </p>
            <div className="flex gap-3">
              {[Facebook, Youtube, Linkedin].map((Icon, index) => (
                <motion.div key={index} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={columnVariants}>
            <h3 className="font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-3 text-sm">
              {["Vận chuyển nội địa", "Vận chuyển quốc tế", "Giao hàng COD", "Quản lý kho"].map((item, i) => (
                <motion.li key={i} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={columnVariants}>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm">
              {["Trung tâm trợ giúp", "Câu hỏi thường gặp", "Chính sách vận chuyển", "Điều khoản dịch vụ"].map(
                (item, i) => (
                  <motion.li key={i} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </motion.li>
                ),
              )}
            </ul>
          </motion.div>

          <motion.div variants={columnVariants}>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Từ Liêm, Thành Phố Hà Nội</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-5 w-5 shrink-0" />
                <span>0896315601</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-5 w-5 shrink-0" />
                <span>hpbinh200x@gmail.com</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground"
        >
          <p>&copy; 2025 VietLogistics. Tất cả quyền được bảo lưu.</p>
        </motion.div>
      </div>
    </footer>
  )
}
