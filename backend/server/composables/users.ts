import {User} from "@prisma/client";
import {prisma} from "~/database";
import {EventHandlerRequest, getHeader, H3Event} from "h3";
import jwt from "jsonwebtoken";
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

    client.capture({
        event: 'login_attempt',
        distinctId: 'anonymous',
        properties: {
            authorization
        }
    });

    if (!authorization) {
        client.capture({
            event: 'login_error',
            distinctId: 'anonymous',
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
            distinctId: 'anonymous',
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
            distinctId: 'anonymous',
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
            distinctId: 'anonymous',
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
    const userToken = await prisma.token.findFirst({
        where: {
            token
        }
    });

    if (!userToken) {
        return LoginError.TokenInvalid;
    }

    if (userToken.expiresAt < new Date()) {
        await prisma.token.delete({
            where: {
                token
            }
        });
        return LoginError.ExpiredToken;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return LoginError.TokenInvalid;
        }
        return decoded;
    })

    // Update the token expiration
    await prisma.token.update({
        where: {
            token
        },
        data: {
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * TOKEN_EXPIRATION_HOURS)
        }
    });

    const user = await prisma.user.findFirst({
        where: {
            id: userToken.userId
        }
    });

    if (!user) {
        return LoginError.UserNotFound;
    }

    return user;
}

export const createTokenForUser = async (userId: string): Promise<string> => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });

    await prisma.token.create({
        data: {
            userId,
            token,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * TOKEN_EXPIRATION_HOURS)
        }
    });

    return token;
}