import { Request, Response } from 'express';
import * as orderService from '../services/order.service';

export const autoAssign = async (req: Request, res: Response) => {
    try {
        const result = await orderService.autoAssignDriverService(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
