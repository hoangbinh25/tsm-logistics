import { Request, Response } from 'express';
import * as warehouseService from '../services/warehouse.service';

export const getWarehouses = async (req: Request, res: Response) => {
    try {
        const warehouses = await warehouseService.getAllWarehouses();
        res.json(warehouses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createWarehouse = async (req: Request, res: Response) => {
    try {
        const newItem = await warehouseService.createWarehouse(req.body);
        res.status(201).json({ message: "Thêm kho thành công", data: newItem });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi thêm kho: " + error.message });
    }
};

export const updateWarehouse = async (req: Request, res: Response) => {
    try {
        const updated = await warehouseService.updateWarehouse(req.params.id, req.body);
        res.json({ message: "Cập nhật thành công", data: updated });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi cập nhật: " + error.message });
    }
};

export const deleteWarehouse = async (req: Request, res: Response) => {
    try {
        await warehouseService.deleteWarehouse(req.params.id);
        res.json({ message: "Xóa thành công" });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};