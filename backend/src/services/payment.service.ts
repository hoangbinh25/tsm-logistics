import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment'; 

export const createPaymentUrl = async (order: any, method: 'MOMO' | 'VNPAY') => {
    const amount = order.tong_thanh_toan;
    const orderId = order.ma_don_hang;
    const orderInfo = `Thanh toan don hang ${orderId}`;
    const requestId = orderId + new Date().getTime(); 

    // --- LOGIC MOMO (Dùng FETCH) ---
    if (method === 'MOMO') {
        const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=&ipnUrl=${process.env.MOMO_RETURN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${process.env.MOMO_PARTNER_CODE}&redirectUrl=${process.env.MOMO_RETURN_URL}&requestId=${requestId}&requestType=captureWallet`;
        
        const signature = crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY as string)
            .update(rawSignature).digest('hex');

        const requestBody = {
            partnerCode: process.env.MOMO_PARTNER_CODE,
            partnerName: "Test Momo",
            storeId: "MomoTestStore",
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: process.env.MOMO_RETURN_URL,
            ipnUrl: process.env.MOMO_RETURN_URL,
            lang: "vi",
            requestType: "captureWallet",
            autoCapture: true,
            extraData: "",
            signature: signature
        };

        const response = await fetch(process.env.MOMO_ENDPOINT as string, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(requestBody) // Fetch bắt buộc phải stringify body
        });

        const data = await response.json();
        
        // Kiểm tra xem Momo có trả về link không
        if (data && data.payUrl) {
            return data.payUrl;
        } else {
            console.error("MOMO ERROR:", data);
            throw new Error(data.message || "Lỗi tạo link thanh toán Momo");
        }
    }

    if (method === 'VNPAY') {
        let vnp_Params: any = {};
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');

        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = process.env.VNP_TMN_CODE;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; 
        vnp_Params['vnp_ReturnUrl'] = process.env.VNP_RETURN_URL;
        vnp_Params['vnp_IpAddr'] = '127.0.0.1'; 
        vnp_Params['vnp_CreateDate'] = createDate;

        vnp_Params = sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET as string);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        
        vnp_Params['vnp_SecureHash'] = signed;
        
        const paymentUrl = process.env.VNP_URL + '?' + qs.stringify(vnp_Params, { encode: false });
        return paymentUrl;
    }
};

function sortObject(obj: any) {
	let sorted: any = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) str.push(encodeURIComponent(key));
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}