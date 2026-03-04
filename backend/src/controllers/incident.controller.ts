import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as incidentService from '../services/incident.service';

export const reportIncident = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

        const body = req.body;
        const incident = await incidentService.reportIncidentService({
            userId,
            ...body
        });

        res.status(201).json({
            message: "Báo cáo sự cố thành công",
            data: incident
        });
    } catch (error: any) {
        console.error("Report Incident Error:", error);
        res.status(500).json({ message: error.message || "Lỗi hệ thống" });
    }
};

export const getIncidents = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;
        const role = req.user?.role || 'USER';
        if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

        const incidents = await incidentService.getIncidentsService(role as string, userId);
        res.status(200).json({
            message: "Lấy danh sách sự cố thành công",
            data: incidents
        });
    } catch (error: any) {
        console.error("Get Incidents Error:", error);
        res.status(500).json({ message: error.message || "Lỗi hệ thống" });
    }
};

export const updateIncidentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, ghi_chu_quan_ly } = req.body;

        const updated = await incidentService.updateIncidentStatusService(id, status, ghi_chu_quan_ly);
        res.status(200).json({
            message: "Cập nhật trạng thái sự cố thành công",
            data: updated
        });
    } catch (error: any) {
        console.error("Update Incident Error:", error);
        res.status(500).json({ message: error.message || "Lỗi hệ thống" });
    }
};
