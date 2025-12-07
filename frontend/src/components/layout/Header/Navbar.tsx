import {
  ChevronDown,
  ShoppingCart,
  Search,
  Menu,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const navItems = [
  { name: "HOME", href: "/", hasDropdown: true, active: true },
  { name: "ABOUT US", href: "/about", hasDropdown: false, active: false },
  { name: "SERVICES", href: "/services", hasDropdown: true, active: false },
  { name: "BLOG", href: "/blog", hasDropdown: true, active: false },
  { name: "PAGES", href: "/page", hasDropdown: true, active: false },
  { name: "CONTACT", href: "/contact", hasDropdown: false, active: false },
]

export default function Navbar() {
  return (
    <div className="bg-white h[94px] shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img
            src="https://elegantpixelstheme.com/tranzit/assets/img/banner/truck.png"
            alt="Tranzit"
            className="h-10"
          />
          <span className="text-xl font-bold text-gray-800">Tranzit</span>
        </a>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <motion.div 
              key={item.name}
              whileHover={{ y: -2 }}
              >
              <Link 
                to={item.href}
                  className={`font-semibold flex items-center space-x-1 transition-colors ${
                    item.active
                      ? "text-red-500"
                      : "text-gray-700 hover:text-red-500"
                  }`}
                >
                <span>{item.name}</span>
                {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
              
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative cursor-pointer"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              0
            </motion.span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} className="cursor-pointer">
            <Search className="w-6 h-6 text-gray-700" />
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} className="cursor-pointer md:hidden">
            <Menu className="w-6 h-6 text-gray-700" />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-full shadow-lg flex items-center">
              Login & Register
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
