import {createTokenForUser} from "~/composables/users";
import {getHeader} from "h3";
import {prisma} from "~/database";

export default eventHandler(async (event) => {
   // Parse the body from the event
    const body = await readBody(event);
    const authorization = getHeader(event, 'Authorization');

    // if authorization header is present, return 401
    if (authorization) {
        setResponseStatus(event, 401);
        return {
            error: 'Unauthorized',
            message: 'You are already logged in'
        };
    }

    // if body is empty, return 400
    if (!body) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Body is required'
        };
    }

    // if email is not present in the body, return 400
    if (!body.email) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Email is required'
        };
    }

    // if password is not present in the body, return 400
    if (!body.password) {
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

    // login the user
    const token = createTokenForUser(newUser.id);
    setResponseStatus(event, 200);
    return {token};
});