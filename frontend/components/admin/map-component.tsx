"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect } from "react"

// Fix lỗi icon mặc định của Leaflet khi dùng với Webpack/Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png"
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png"
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"

// Tạo icon xe tải (Custom Icon)
const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/741/741407.png", // Link icon xe tải
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -10],
})

// Tạo icon kho (Điểm đến/đi)
const warehouseIcon = new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

interface RouteProps {
  vehicles: any[]
}

export default function MapComponent({ vehicles }: RouteProps) {
  // Center map mặc định ở Việt Nam (Đà Nẵng)
  const defaultCenter: [number, number] = [16.0474, 108.2062]

  return (
    <MapContainer center={defaultCenter} zoom={6} style={{ height: "100%", width: "100%", borderRadius: "12px" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vehicles.map((vehicle) => (
        <div key={vehicle.id}>
          {/* 1. Vẽ đường đi từ Gốc -> Đích */}
          <Polyline 
            positions={[vehicle.startPos, vehicle.endPos]} 
            pathOptions={{ color: vehicle.color || 'blue', weight: 3, opacity: 0.6, dashArray: '10, 10' }} 
          />

          {/* 2. Marker điểm đi */}
          <Marker position={vehicle.startPos} icon={warehouseIcon}>
             <Popup>Kho Gửi: {vehicle.origin}</Popup>
          </Marker>

          {/* 3. Marker điểm đến */}
          <Marker position={vehicle.endPos} icon={warehouseIcon}>
             <Popup>Kho Nhận: {vehicle.dest}</Popup>
          </Marker>

          {/* 4. Marker XE TẢI (Đang di chuyển) */}
          <Marker position={vehicle.currentPos} icon={truckIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{vehicle.bien_kiem_soat}</strong><br/>
                Tài xế: {vehicle.driver}<br/>
                Tốc độ: {vehicle.speed} km/h
              </div>
            </Popup>
          </Marker>
        </div>
      ))}
    </MapContainer>
  )
}