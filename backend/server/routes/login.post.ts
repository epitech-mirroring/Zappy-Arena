import {prisma} from "~/database";
import {readBody, setResponseStatus} from "h3";

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

    const newToken = await prisma.token.create({
        data: {
            userId: user.id,
            token: Math.random().toString(36).substring(2)
        }
    });


    setResponseStatus(event,200);
    return {
        token: newToken.token
    }
});