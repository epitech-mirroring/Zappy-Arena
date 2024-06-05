import {prisma} from "~/database";
import {readBody, setResponseStatus} from "h3";
import jwt from "jsonwebtoken";
import {TOKEN_EXPIRATION_HOURS} from "~/composables/users";

export default eventHandler(async (event) => {
    const body = await readBody(event);
    if (!body) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Body is required'
        };
    }

    if (!body.email) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Email is required'
        };
    }

    if (!body.password) {
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
        setResponseStatus(event, 404);
        return {
            error: 'User not found',
            message: 'User with email not found'
        };
    }

    if (user.password !== body.password) {
        setResponseStatus(event, 401);
        return {
            error: 'Invalid password',
            message: 'Password is incorrect'
        };
    }

    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });

    const newToken = await prisma.token.create({
        data: {
            userId: user.id,
            token: token,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * TOKEN_EXPIRATION_HOURS)
        }
    });


    setResponseStatus(event,200);
    return {
        token: newToken.token
    }
});