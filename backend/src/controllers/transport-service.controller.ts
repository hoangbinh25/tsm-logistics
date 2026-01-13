import { Request, Response } from 'express';
import * as service from '../services/transport-service.service';

export const getServices = async (req: Request, res: Response) => {
    try {
        const data = await service.getAllServices();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createService = async (req: Request, res: Response) => {
    try {
        const newItem = await service.createService(req.body);
        res.status(201).json({ message: "Thêm dịch vụ thành công", data: newItem });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateService = async (req: Request, res: Response) => {
    try {
        const updated = await service.updateService(req.params.id, req.body);
        res.json({ message: "Cập nhật thành công", data: updated });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteService = async (req: Request, res: Response) => {
    try {
        await service.deleteService(req.params.id);
        res.json({ message: "Xóa thành công" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};