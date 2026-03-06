import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await dashboardService.getDashboardStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
