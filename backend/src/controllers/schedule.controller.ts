import { Request, Response } from 'express';
import * as scheduleService from '../services/schedule.service';

export const registerSchedule = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { dates } = req.body;
        console.log("Registering schedules for user:", userId, "dates count:", dates?.length);
        const result = await scheduleService.registerScheduleService(userId, dates);
        res.json(result);
    } catch (error: any) {
        console.error("DEBUG REGISTER ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getMySchedules = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        console.log("Fetching schedules for user:", userId);
        const schedules = await scheduleService.getDriverSchedulesService(userId);
        res.json(schedules);
    } catch (error: any) {
        console.error("DEBUG SCHEDULE ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getAllSchedules = async (req: Request, res: Response) => {
    try {
        const schedules = await scheduleService.getAllSchedulesService();
        res.json(schedules);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await scheduleService.updateScheduleStatusService(id, status);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
