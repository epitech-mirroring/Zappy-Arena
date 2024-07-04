import {prisma} from "~/database";
import {readBody, setResponseStatus} from "h3";
import {client} from "~/posthog";
import {generateAccessToken, generateRefreshToken} from "~/composables/auth";

export default eventHandler(async (event) => {
    const body = await readBody(event);
    const userId = event.context.uniqueId;

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'login',
        properties: {
            body: body
        }
    });
    if (!body) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'login_error',
            properties: {
                error: 'Invalid body'
            }
        });
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Body is required'
        };
    }

    if (!body.email) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'login_error',
            properties: {
                error: 'Invalid body',
                reason: 'Email is required'
            }
        });
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Email is required'
        };
    }

    if (!body.password) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'login_error',
            properties: {
                error: 'Invalid body',
                reason: 'Password is required'
            }
        });
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Password is required'
        };
    }

    const user = await prisma.user.findFirst({
        where: {
            email: body.email
        }
    });

    if (!user) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'login_error',
            properties: {
                error: 'User not found',
                reason: 'User with email not found'
            }
        });
        setResponseStatus(event, 404);
        return {
            error: 'User not found',
            message: 'User with email not found'
        };
    }

    if (user.password !== body.password) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'login_error',
            properties: {
                error: 'Invalid password'
            }
        });
        setResponseStatus(event, 401);
        return {
            error: 'Invalid password',
            message: 'Password is incorrect'
        };
    }

    const refreshToken = await generateRefreshToken(user);
    const accessToken = await generateAccessToken(user);

    client.capture({
        distinctId: user.id,
        event: 'login_success',
        properties: {
            email: user.email
        }
    });

    setResponseStatus(event,200);
    return {
        token: accessToken,
        refreshToken: refreshToken
    }
});