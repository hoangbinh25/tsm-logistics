import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS  
  }
});

export const sendOTPEmail = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: '"TSM Support" <no-reply@tsm.com>',
    to,
    subject: 'Mã xác thực đặt lại mật khẩu',
    html: `<p>Mã OTP của bạn là: <b>${otp}</b></p><p>Mã này sẽ hết hạn sau 1 phút.</p>`
  });
};

export const sendOrderConfirmationEmail = async (to: string, orderDetails: any) => {
  const formatMoney = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  await transporter.sendMail({
    from: `"VietLogistics" <${process.env.MAIL_USER}>`,
    to, 
    subject: `[VietLogistics] Xác nhận đơn hàng #${orderDetails.ma_don_hang}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h2 style="color: #fff; margin: 0;">ĐẶT HÀNG THÀNH CÔNG</h2>
        </div>
        
        <div style="padding: 20px;">
            <p>Xin chào,</p>
            <p>Cảm ơn bạn đã sử dụng dịch vụ vận chuyển của VietLogistics. Đơn hàng của bạn đã được khởi tạo thành công.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f8fafc;">
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Mã vận đơn:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>${orderDetails.ma_don_hang}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Người nhận:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${orderDetails.receiverName} - ${orderDetails.receiverPhone}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Tổng cước phí:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #dc2626; font-weight: bold;">${formatMoney(Number(orderDetails.tong_thanh_toan))}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Thanh toán:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${orderDetails.hinh_thuc_thanh_toan}</td>
                </tr>
            </table>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/tracking/${orderDetails.ma_don_hang}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Theo dõi đơn hàng</a>
            </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 10px; text-align: center; font-size: 12px; color: #64748b;">
            <p>Đây là email tự động, vui lòng không trả lời.</p>
        </div>
      </div>
    `
  });
};