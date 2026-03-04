import { Request, Response } from 'express';
import * as fleetService from '../services/fleet.service';

export const getFleet = async (req: Request, res: Response) => {
    try {
        const vehicles = await fleetService.getAllVehicles();
        res.json(vehicles);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createFleet = async (req: Request, res: Response) => {
    try {
        const newVehicle = await fleetService.createVehicle(req.body);
        res.status(201).json({ message: "Thêm xe thành công", data: newVehicle });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi thêm xe: " + error.message });
    }
};

export const updateFleet = async (req: Request, res: Response) => {
    try {
        const updated = await fleetService.updateVehicle(req.params.id, req.body);
        res.json({ message: "Cập nhật thành công", data: updated });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi cập nhật: " + error.message });
    }
};

export const checkMaintenance = async (req: Request, res: Response) => {
    try {
        const needMaintenance = await fleetService.checkMaintenanceAndNotify();
        res.json({ message: "Đã kiểm tra bảo dưỡng", count: needMaintenance.length, data: needMaintenance });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi kiểm tra bảo dưỡng: " + error.message });
    }
};

export const maintainFleet = async (req: Request, res: Response) => {
    try {
        const updated = await fleetService.maintainVehicle(req.params.id);
        res.json({ message: "Xác nhận bảo dưỡng thành công", data: updated });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi bảo dưỡng: " + error.message });
    }
};

export const updateLocation = async (req: Request, res: Response) => {
    try {
        const { location } = req.body;
        const updated = await fleetService.updateVehicleLocation(req.params.id, location);
        res.json({ message: "Cập nhật vị trí thành công", data: updated });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi cập nhật vị trí: " + error.message });
    }
};

export const deleteFleet = async (req: Request, res: Response) => {
    try {
        await fleetService.deleteVehicle(req.params.id);
        res.json({ message: "Xóa thành công" });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi xóa xe: " + error.message });
    }
};