import { Request, Response } from 'express';
import * as ghtkService from '../services/ghtk.service';

export const calculateFee = async (req: Request, res: Response) => {
    try {
        const params: ghtkService.GHTKFeeParams = {
            pick_province: req.query.pick_province as string,
            pick_district: req.query.pick_district as string,
            province: req.query.province as string,
            district: req.query.district as string,
            address: req.query.address as string,
            weight: Number(req.query.weight) || 1000,
            value: Number(req.query.value) || 0,
            transport: (req.query.transport as 'road' | 'fly') || 'road'
        };

        if (!params.pick_province || !params.pick_district || !params.province || !params.district) {
            return res.status(400).json({ message: "Thiếu thông tin tỉnh/huyện để tính phí" });
        }

        const fee = await ghtkService.calculateGHTKFee(params);
        res.status(200).json({
            message: "Tính phí thành công",
            data: { fee }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderStatus = async (req: Request, res: Response) => {
    try {
        const { label } = req.params;
        const status = await ghtkService.getGHTKOrderStatus(label);
        res.status(200).json({ data: status });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const { label_id, status_id, reason, action_time } = req.body;
        console.log(`GHTK Webhook: Order ${label_id} changed to status ${status_id}`);

        // Cập nhật trạng thái trong DB của mình tương ứng với status_id của GHTK
        // mapping logic here...

        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("GHTK Webhook Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

