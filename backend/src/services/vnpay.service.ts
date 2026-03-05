import crypto from "crypto";
import qs from "qs";
import moment from "moment";
import prisma from "../config/prisma";

export const createPaymentUrl = async (req: any, order: any, amount: number) => {
    process.env.TZ = "Asia/Ho_Chi_Minh";

    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || req.socket?.remoteAddress || "127.0.0.1";
    if (typeof ipAddr === "string") {
        ipAddr = ipAddr.split(",")[0].trim();
    } else if (Array.isArray(ipAddr)) {
        ipAddr = ipAddr[0].trim();
    }

    const tmnCode = process.env.VNP_TMN_CODE?.trim() || "";
    const secretKey = process.env.VNP_HASH_SECRET?.trim() || "";
    let vnpUrl = process.env.VNP_URL?.trim() || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = process.env.VNP_RETURN_URL?.trim() || "http://localhost:3000/orders/vnpay-return";

    if (!tmnCode || !secretKey) {
        throw new Error("Thiếu cấu hình VNP_TMN_CODE hoặc VNP_HASH_SECRET trong file .env");
    }

    const orderId = order.ma_don_hang;

    let vnp_Params: any = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = `${orderId}_${moment(date).format("HHmmss")}`;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang " + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    const sortedKeys = Object.keys(vnp_Params).sort();
    let signData = "";
    const finalParams: any = {};

    sortedKeys.forEach((key) => {
        const value = vnp_Params[key];
        if (value !== undefined && value !== null && String(value).length > 0) {
            if (signData.length > 0) signData += "&";
            const encodedValue = encodeURIComponent(String(value)).replace(/%20/g, "+");
            signData += encodeURIComponent(key) + "=" + encodedValue;
            finalParams[key] = value; // Phục vụ việc tạo URL cuối cùng
        }
    });

    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Gắn mã hash vào tham số
    finalParams["vnp_SecureHash"] = signed;

    // Tạo URL hoàn chỉnh
    const query = Object.keys(finalParams)
        .sort()
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(String(finalParams[key])).replace(/%20/g, "+"))
        .join("&");

    vnpUrl += "?" + query;

    return vnpUrl;
};

export const verifyIpn = async (vnp_Params: any) => {
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    // 1. Sắp xếp key
    const sortedKeys = Object.keys(vnp_Params).sort();

    // 2. Tạo chuỗi hashing
    let signData = "";
    sortedKeys.forEach((key) => {
        const value = vnp_Params[key];
        // VNPay 2.1.0: Bỏ qua các tham số rỗng
        if (value !== undefined && value !== null && String(value).length > 0) {
            if (signData.length > 0) signData += "&";
            signData += encodeURIComponent(key) + "=" + encodeURIComponent(String(value)).replace(/%20/g, "+");
        }
    });

    // 3. Hash
    const secretKey = process.env.VNP_HASH_SECRET?.trim() || "";
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash !== signed) {
        console.log("== VNPay Signature Mismatch ==");
        console.log("SignData (Calculated):", signData);
        console.log("Hash received:", secureHash);
        console.log("Hash computed:", signed);
        throw new Error("Invalid signature");
    }

    return vnp_Params;
};

function sortObject(obj: any) {
    let sorted: any = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
