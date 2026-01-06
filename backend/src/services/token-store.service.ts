import bcrypt from "bcrypt";
import prisma from "../config/prisma";

export function hashToken(token: string) {
    return bcrypt.hash(token, 10);
}

export function compareToken(token: string, hash: string) {
    return bcrypt.compare(token, hash);
}

export async function saveRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenHash = await hashToken(refreshToken);
    await prisma.nguoiDung.update({
        where: {
            id: userId,
        },
        data: {
            refresh_token_hash: refreshTokenHash,
            refresh_token_iat: new Date(),
        },
    });
}