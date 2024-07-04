import {User} from "@prisma/client";
import {prisma} from "~/database";
import * as jose from "jose";

type JWTPayload = {
    email: string;
    name: string;
    userId: string;
}

export type JWTAccessPayload = {
    type: 'access';
} & JWTPayload;

export type JWTRefreshPayload = {
    type: 'refresh';
} & JWTPayload;

export const validateAccessToken = async (token: string): Promise<User | null> => {
    const isValid = await verifyToken(token);
    if (isValid) {
        const payload = await decodeToken(token);
        if (payload) {
            if (payload.type !== 'access') {
                return null;
            }
            return prisma.user.findUnique({
                where: {
                    id: payload.userId
                }
            });
        }
    }
    return null;
}

export const validateRefreshToken = async (token: string): Promise<User | null> => {
    const isValid = await verifyToken(token);
    if (isValid) {
        const payload = await decodeToken(token);
        if (payload) {
            if (payload.type !== 'refresh') {
                return null;
            }
            const refreshTokens = await prisma.refreshToken.findMany({
                where: {
                    userId: payload.userId
                }
            });
            if (!refreshTokens.find(t => t.token === token)) {
                return null;
            }
            return prisma.user.findUnique({
                where: {
                    id: payload.userId
                }
            });
        }
    }
    return null;
}

export const generatePayload = (user: User, type: 'access' | 'refresh' = 'access'): JWTAccessPayload | JWTRefreshPayload => {
    return {
        type,
        email: user.email,
        name: user.name,
        userId: user.id
    };
}

export const generateAccessToken = async (user: User): Promise<string> => {
    const privateKey = process.env.JWT_PRIVATE_KEY as string;
    const secret = await jose.importPKCS8(privateKey, 'ES256');

    return await new jose.SignJWT(generatePayload(user, 'access'))
        .setProtectedHeader({alg: 'ES256'})
        .setIssuedAt()
        .setIssuer('arena')
        .setExpirationTime('15m')
        .sign(secret);
}

export const generateRefreshToken = async (user: User): Promise<string> => {
    const privateKey = process.env.JWT_PRIVATE_KEY as string;
    const secret = await jose.importPKCS8(privateKey, 'ES256');
    const token = await new jose.SignJWT(generatePayload(user, 'refresh'))
        .setProtectedHeader({alg: 'ES256'})
        .setIssuedAt()
        .setIssuer('arena')
        .setExpirationTime('7d')
        .sign(secret);

    await prisma.refreshToken.create({
        data: {
            token,
            userId: user.id
        }
    });

    return token;
}

export const verifyToken = async (token: string): Promise<boolean> => {
    const publicKey = process.env.JWT_PUBLIC_KEY as string;
    const secret = await jose.importSPKI(publicKey, 'ES256');

    const verifyResult = await jose.jwtVerify(token, secret, {
        algorithms: ['ES256'],
        issuer: 'arena'
    });

    if (verifyResult.payload.exp < Date.now() / 1000) {
        return false;
    }

    if (verifyResult.payload.iss !== 'arena') {
        return false;
    }

    return true;
}

export const decodeToken = async (token: string): Promise<JWTAccessPayload | JWTRefreshPayload | null> => {
    return jose.decodeJwt(token) as any;
}

export const invalidateToken = async (token: string): Promise<boolean> => {
    const valid = await validateRefreshToken(token);
    if (valid) {
        await prisma.refreshToken.deleteMany({
            where: {
                token: token
            }
        });
        return true;
    }
    return false;
}

export const refreshToken = async (token: string): Promise<{accessToken: string, refreshToken: string} | null> => {
    const valid = await validateRefreshToken(token);
    if (valid) {
        const refreshToken = await generateRefreshToken(valid);
        const accessToken = await generateAccessToken(valid);
        await invalidateToken(token);
        return {
            accessToken,
            refreshToken
        };
    }
    return null;
}

export const login = async (email: string, password: string): Promise<User | null> => {
    const user = await prisma.user.findFirst({
        where: {
            email
        }
    });
    if (user) {
        if (user.password === password) {
            return user;
        }
    }
    return null;
}

export const register = async (email: string, password: string, name: string): Promise<User | null> => {
    const sameEmail = await prisma.user.findFirst({
        where: {
            email
        }
    });

    if (sameEmail) {
        return null;
    }

    return prisma.user.create({
        data: {
            email,
            password,
            name
        }
    });
}