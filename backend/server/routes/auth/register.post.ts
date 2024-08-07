import {getHeader} from "h3";
import {prisma} from "~/database";
import {client} from "~/posthog";
import {
    generateAccessToken,
    generateRefreshToken,
    register
} from "~/composables/auth";

export default eventHandler(async (event) => {
   // Parse the body from the event
    const body = await readBody(event);
    const authorization = getHeader(event, 'Authorization');
    const userId = event.context.uniqueId;

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'register',
        properties: {
            body
        }
    });

    // if authorization header is present, return 401
    if (authorization) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'register_error',
            properties: {
                error: 'Unauthorized',
                reason: 'You are already logged in'
            }
        });
        setResponseStatus(event, 401);
        return {
            error: 'Unauthorized',
            message: 'You are already logged in'
        };
    }

    // if body is empty, return 400
    if (!body) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'register_error',
            properties: {
                error: 'Invalid body',
                reason: 'Body is required'
            }
        });
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Body is required'
        };
    }

    // if email is not present in the body, return 400
    if (!body.email) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'register_error',
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

    // if password is not present in the body, return 400
    if (!body.password) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'register_error',
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

    let name: string = "";
    if (!body.name) {
        const email_parts = body.email.split('@')[0].split('.');
        name = email_parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    } else {
        name = body.name;
    }

    // if user with email is not found, return 400
    const user = await prisma.user.findFirst({
        where: {
            email: body.email
        }
    });

    if (user) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'register_error',
            properties: {
                error: 'User already exists',
                reason: 'User with email already exists'
            }
        });
        setResponseStatus(event, 400);
        return {
            error: 'User already exists',
            message: 'User with email already exists'
        };
    }

    // create the user
    const newUser = await prisma.user.create({
        data: {
            email: body.email,
            password: body.password,
            name
        }
    });

    client.capture({
        distinctId: newUser.id,
        event: 'register_success',
        properties: {
            user: newUser
        }
    });

    // login the user
    const final_user = await register(body.email, body.password, name);
    const accessToken = await generateAccessToken(final_user);
    const refreshToken = await generateRefreshToken(final_user);
    setResponseStatus(event, 200);
    return {
        token: accessToken,
        refreshToken: refreshToken
    };
});