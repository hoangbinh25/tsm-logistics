import { Request, Response } from "express";
import * as vnpayService from "../services/vnpay.service";
import prisma from "../config/prisma";

export const getPaymentLink = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await prisma.donHang.findUnique({ where: { id } });

        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        if (order.hinh_thuc_thanh_toan === "COD") return res.status(400).json({ message: "Đơn hàng COD không cần thanh toán online" });

        // Tạo bản ghi thanh toán nếu chưa có hoặc đang pending
        let payment = await prisma.thanhToan.findFirst({
            where: { don_hang_id: id, trang_thai: "PENDING" }
        });

        if (!payment) {
            payment = await prisma.thanhToan.create({
                data: {
                    don_hang_id: id,
                    so_tien: order.tong_thanh_toan,
                    phuong_thuc: "VNPAY",
                    trang_thai: "PENDING"
                }
            });
        }

        const paymentUrl = await vnpayService.createPaymentUrl(req, order, Number(payment.so_tien));

        res.status(200).json({ paymentUrl });
    } catch (error: any) {
        console.error("Get Payment Link Error:", error);
        res.status(500).json({ message: "Lỗi tạo link thanh toán" });
    }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const payment = await prisma.thanhToan.findFirst({
            where: { don_hang_id: id },
            orderBy: { thoi_gian_tao: "desc" }
        });

        if (!payment) return res.status(404).json({ status: "NOT_FOUND", message: "Chưa có giao dịch" });

        res.status(200).json({ status: payment.trang_thai, ma_giao_dich: payment.ma_giao_dich });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi kiểm tra trạng thái thanh toán" });
    }
};

export const vnpayIpn = async (req: Request, res: Response) => {
    try {
        let vnp_Params = req.query;
        const verifiedParams = await vnpayService.verifyIpn(vnp_Params);

        const vnp_TxnRef = verifiedParams["vnp_TxnRef"] as string; // ma_don_hang_HHmmss
        const orderCode = vnp_TxnRef.split("_")[0];
        const vnp_ResponseCode = verifiedParams["vnp_ResponseCode"];
        const ma_giao_dich = verifiedParams["vnp_TransactionNo"] as string;

        const order = await prisma.donHang.findUnique({
            where: { ma_don_hang: orderCode },
            include: { thanh_toan: { where: { trang_thai: "PENDING" } } }
        });

        if (!order) return res.status(200).json({ RspCode: "01", Message: "Order not found" });

        const pendingPayment = order.thanh_toan[0];
        if (!pendingPayment) return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });

        if (Number(verifiedParams["vnp_Amount"]) !== Number(pendingPayment.so_tien) * 100) {
            return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
        }

        if (vnp_ResponseCode === "00") {
            // Thanh toán thành công
            await prisma.$transaction(async (tx) => {
                await tx.thanhToan.update({
                    where: { id: pendingPayment.id },
                    data: { trang_thai: "SUCCESS", ma_giao_dich }
                });

                // Cập nhật trạng thái đơn hàng (Có thể là CHO_XAC_NHAN, v.v.)
                if (order.trang_thai_don_hang === "TAO_MOI") {
                    await tx.donHang.update({
                        where: { id: order.id },
                        data: { trang_thai_don_hang: "CHO_XAC_NHAN" }
                    });
                }
            });
        } else {
            // Thất bại
            await prisma.thanhToan.update({
                where: { id: pendingPayment.id },
                data: { trang_thai: "FAILED", ma_giao_dich }
            });
        }

        res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    } catch (error: any) {
        console.error("VNPay IPN Error:", error);
        res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
    }
};
