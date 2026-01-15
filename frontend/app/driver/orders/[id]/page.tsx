"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, ArrowLeft, CheckCircle2, Box } from "lucide-react"

export default function DriverOrderDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { http } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Fetch chi tiết đơn
  useEffect(() => {
     setOrder({
         id: id,
         ma_don_hang: "DH-9912",
         trang_thai: "DA_PHAN_CONG", // DA_PHAN_CONG -> DANG_LAY_HANG -> DANG_GIAO -> DA_GIAO
         nguoi_nhan: "Anh Bình",
         sdt_nhan: "0988123456",
         dia_chi_nhan: "123 Giải Phóng, Hà Nội",
         ghi_chu: "Gọi trước khi giao 30p"
     })
  }, [id])

  // Logic cập nhật trạng thái
  const handleUpdateStatus = async () => {
     if(!order) return
     let nextStatus = ""
     
     // Máy trạng thái đơn giản
     if (order.trang_thai === 'DA_PHAN_CONG') nextStatus = 'DANG_LAY_HANG'
     else if (order.trang_thai === 'DANG_LAY_HANG') nextStatus = 'DANG_VAN_CHUYEN'
     else if (order.trang_thai === 'DANG_VAN_CHUYEN') nextStatus = 'DA_GIAO'

     setLoading(true)
     try {
         // Gọi API Backend update status
         // await http.put(...)
         
         // Giả lập thành công
         setOrder({ ...order, trang_thai: nextStatus })
         alert("Đã cập nhật trạng thái!")
     } catch(e) {
         console.error(e)
     } finally {
         setLoading(false)
     }
  }

  // Render nút bấm dựa theo trạng thái hiện tại
  const renderActionButton = () => {
      switch(order?.trang_thai) {
          case 'DA_PHAN_CONG':
              return <Button size="lg" className="w-full bg-blue-600 h-14 text-lg" onClick={handleUpdateStatus}>Bắt đầu đi lấy hàng</Button>
          case 'DANG_LAY_HANG':
              return <Button size="lg" className="w-full bg-orange-600 h-14 text-lg" onClick={handleUpdateStatus}>Đã lấy hàng xong</Button>
          case 'DANG_VAN_CHUYEN':
              return <Button size="lg" className="w-full bg-green-600 h-14 text-lg" onClick={handleUpdateStatus}>Xác nhận giao thành công</Button>
          case 'DA_GIAO':
              return <Button disabled size="lg" className="w-full bg-gray-400 h-14 text-lg">Đơn hàng đã hoàn tất</Button>
          default:
              return null
      }
  }

  if (!order) return <div className="p-4">Đang tải...</div>

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Navbar con */}
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft /></Button>
          <h1 className="font-bold text-lg">Chi tiết đơn {order.ma_don_hang}</h1>
      </div>

      <div className="p-4 space-y-4">
          {/* Thông tin người nhận */}
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
              <h3 className="font-semibold text-gray-500 text-sm uppercase">Thông tin giao hàng</h3>
              <div className="flex items-start gap-3">
                  <MapPin className="text-red-500 w-5 h-5 mt-1" />
                  <div>
                      <p className="font-bold text-lg">{order.dia_chi_nhan}</p>
                      <p className="text-gray-500 text-sm">Người nhận: {order.nguoi_nhan}</p>
                  </div>
              </div>
              <Button variant="outline" className="w-full gap-2 text-green-600 border-green-200 bg-green-50" onClick={() => window.open(`tel:${order.sdt_nhan}`)}>
                  <Phone className="w-4 h-4" /> Gọi khách ({order.sdt_nhan})
              </Button>
          </div>

          {/* Ghi chú */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
             <h3 className="font-semibold text-gray-500 text-sm uppercase mb-2">Ghi chú vận đơn</h3>
             <p className="bg-yellow-50 p-3 rounded-md text-sm border border-yellow-100 text-yellow-800">
                 {order.ghi_chu || "Không có ghi chú"}
             </p>
          </div>
      </div>

      {/* Action Bar Cố định ở đáy */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t md:max-w-md md:mx-auto">
          {renderActionButton()}
      </div>
    </div>
  )
}