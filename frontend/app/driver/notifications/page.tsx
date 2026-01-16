"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Bell, Package, Info, Clock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DriverNotificationsPage() {
  const { http } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotis = async () => {
        try {
            const res = await http(`${process.env.NEXT_PUBLIC_API_URL}/notifications`)
            if (res.ok) setNotifications((await res.json()).data)
        } catch (error) {
            console.error(error)
        }
    }
    fetchNotis()
  }, [http])

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white p-4 sticky top-0 z-10 border-b flex justify-between items-center shadow-sm">
         <h1 className="font-bold text-lg">Thông báo</h1>
         <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
             {notifications.filter(n => !n.isRead).length} mới
         </span>
      </div>

      <ScrollArea className="h-full">
          <div className="divide-y">
            {loading ? (
                <div className="p-10 text-center text-gray-400">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-gray-400 gap-3">
                    <Bell className="w-10 h-10 opacity-20" />
                    <p>Hiện chưa có thông báo nào</p>
                </div>
            ) : (
                notifications.map((notif) => (
                    <div 
                        key={notif.id} 
                        className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : 'bg-white'}`}
                    >
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                            notif.type === 'ORDER' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {notif.type === 'ORDER' ? <Package className="w-5 h-5"/> : <Info className="w-5 h-5"/>}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`text-sm font-semibold ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {notif.title}
                                </h3>
                                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{notif.content}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" /> 
                                {new Date(notif.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} 
                                {" - "}
                                {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                ))
            )}
          </div>
      </ScrollArea>
    </div>
  )
}