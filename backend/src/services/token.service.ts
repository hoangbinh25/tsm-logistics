import jwt from "jsonwebtoken";

export type JwtRole = "KHACH_HANG" | "TAI_XE" | "QUAN_LY";
export type JwtPayload = {
    sub: string;
    role: JwtRole;
}

export function signAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
        expiresIn: "1h",
    })
}

export function signRefreshToken(payload: JwtPayload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: "7d",
    })
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
}