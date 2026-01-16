import { DriverBottomNav } from "@/components/driver/bottom-nav"
import { Toaster } from 'react-hot-toast';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Giới hạn khung hình giống điện thoại */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative pb-20">
        
        {/* Header Mobile */}
        <header className="bg-blue-600 text-white p-4 sticky top-0 z-40 shadow-md flex justify-between items-center">
            <h1 className="font-bold text-lg">Tài xế Pro</h1>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs">HB</div>
        </header>

        {children}
        <Toaster position="top-center" reverseOrder={false} />
        <DriverBottomNav />
      </div>
    </div>
  )
}