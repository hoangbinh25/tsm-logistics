import { Request, Response } from 'express';
import * as revenueService from '../services/revenue.service';

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await revenueService.getRevenueStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};