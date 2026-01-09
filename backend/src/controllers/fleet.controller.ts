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

export const deleteFleet = async (req: Request, res: Response) => {
    try {
        await fleetService.deleteVehicle(req.params.id);
        res.json({ message: "Xóa thành công" });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi xóa xe: " + error.message });
    }
};