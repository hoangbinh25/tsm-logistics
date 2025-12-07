import { Outlet } from "react-router-dom"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet /> {/* nơi render page con */}
      </main>
      <Footer />
    </div>
  )
}
