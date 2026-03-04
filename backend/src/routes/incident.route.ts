import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { getIncidents, reportIncident, updateIncidentStatus } from "../controllers/incident.controller";

const route = Router();

// Tài xế báo cáo sự cố
route.post("/report", verifyToken, reportIncident);

// Lấy danh sách sự cố (Tài xế xem đơn của mình, Admin xem tất cả)
route.get("/", verifyToken, getIncidents);

// Admin cập nhật trạng thái xử lý
route.patch("/:id/status", verifyToken, updateIncidentStatus);

export default route;
