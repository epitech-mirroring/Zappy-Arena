import {User} from "@prisma/client";
import {prisma} from "~/database";
import {EventHandlerRequest, getHeader, H3Event} from "h3";
import * as jose from "jose";
import {client} from "~/posthog";

export const TOKEN_EXPIRATION_HOURS = 24 * 3;

export enum LoginError {
    TokenInvalid = 'Token invalid',
    ExpiredToken = 'Expired token',
    UserNotFound = 'User not found'
}

export type ErrorResponse = {
    error: LoginError;
    message: string;
}

export const findUserById = async (userId: string): Promise<User | null> => {
    return prisma.user.findFirst({
        where: {
            id: userId
        }
    });
}

export const login = async (event: H3Event<EventHandlerRequest>): Promise<User | ErrorResponse> => {
    let authorization = getHeader(event, 'Authorization');
    const userId = getHeader(event, 'X-User-Id');

    client.capture({
        event: 'login_attempt',
        distinctId: userId || 'anonymous',
        properties: {
            authorization
        }
    });

    if (!authorization) {
        client.capture({
            event: 'login_error',
            distinctId: userId || 'anonymous',
            properties: {
                error: 'No authorization header provided'
            }
        });
        setResponseStatus(event, 401);
        return {
            error: LoginError.TokenInvalid,
            message: 'No authorization header provided'
        }
    }
    let tmp = authorization.split(' ');
    if (tmp.length !== 2 || tmp[0] !== 'Bearer') {
        client.capture({
            event: 'login_error',
            distinctId: userId || 'anonymous',
            properties: {
                error: 'Invalid authorization header'
            }
        });
        setResponseStatus(event, 401);
        return {
            error: LoginError.TokenInvalid,
            message: 'Invalid authorization header'
        }
    }
    const token = tmp[1];


    if (!token) {
        client.capture({
            event: 'login_error',
            distinctId: userId || 'anonymous',
            properties: {
                error: 'No authorization header provided'
            }
        });
        setResponseStatus(event, 401);
        return {
            error: LoginError.TokenInvalid,
            message: 'No authorization header provided'
        }
    }

    const loginResult = await _login(token);

    if (typeof loginResult === 'string') {
        client.capture({
            event: 'login_error',
            distinctId: userId || 'anonymous',
            properties: {
                error: 'Invalid token',
                reason: loginResult
            }
        });
        setResponseStatus(event, 401);
        return {
            error: loginResult,
            message: 'Invalid token'
        }
    }

    client.capture({
        event: 'login_success',
        distinctId: loginResult.id,
        properties: {
            email: loginResult.email
        }
    });

    return loginResult;
}

export const _login = async (token: string): Promise<User | LoginError> => {
    const publicKey = process.env.JWT_PUBLIC_KEY as string;
    const secret = await jose.importSPKI(publicKey, 'ES256');

    try {
        const verifyResult = await jose.jwtVerify(token, secret, {
            algorithms: ['ES256'],
            issuer: 'arena'
        });

        const decoded = await jose.jwtDecrypt(token, secret)
        const payload = decoded.payload as {id: string, name: string, email: string, groupId?: string};

        const user = await findUserById(payload.id);

        if (!user) {
            return LoginError.UserNotFound;
        }

        if (user.email !== payload.email) {
            return LoginError.TokenInvalid;
        }

        if (user.name !== payload.name) {
            return LoginError.TokenInvalid;
        }

        if (user.groupId !== payload.groupId) {
            return LoginError.TokenInvalid;
        }

        if (verifyResult.payload.exp < Date.now() / 1000) {
            return LoginError.ExpiredToken;
        }

        if (verifyResult.payload.iss !== 'arena') {
            return LoginError.TokenInvalid;
        }

        return user;
    } catch (e) {
        return LoginError.ExpiredToken;
    }
}

export const createTokenForUser = async (user: User): Promise<string> => {
    const privateKey = process.env.JWT_PRIVATE_KEY as string;
    const secret = await jose.importPKCS8(privateKey, 'ES256');

    return await new jose.SignJWT({
        id: user.id,
        name: user.name,
        email: user.email,
        groupId: user.groupId
    })
        .setProtectedHeader({alg: 'ES256'})
        .setIssuedAt()
        .setIssuer('arena')
        .setExpirationTime(TOKEN_EXPIRATION_HOURS + 'h')
        .sign(secret);
}