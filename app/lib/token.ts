
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET as string;

export interface TokenPayload {
    id: string;
    username: string;
    avatar: string;
}

export function signToken(payload: TokenPayload): string {
    return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
}

export async function getVerifiedToken() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")
    if (!token) {
        return null
    }
    const verified_token = verifyToken(token.value)
    if (!verified_token) {
        return null
    }
    return verified_token
}