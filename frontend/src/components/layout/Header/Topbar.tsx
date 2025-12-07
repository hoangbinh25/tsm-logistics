import {
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react"
import { motion } from "framer-motion"

export default function Topbar() {
  return (
    <div className="w-full shadow sticky top-0 z-50">
      {/* Topbar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 text-white py-2 px-4"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-red-500" />
              <span>Phone: +84 896315601</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-red-500" />
              <span>Email: hpbinh200x@gmail.com</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Social */}
            <div className="flex space-x-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center cursor-pointer"
              >
                <Facebook className="w-4 h-4 text-white" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center cursor-pointer"
              >
                <Twitter className="w-4 h-4 text-white" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-white" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center cursor-pointer"
              >
                <Linkedin className="w-4 h-4 text-white" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      
    </div>
  )
}
