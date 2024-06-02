import {setResponseStatus} from "h3";
import {prisma} from "~/database";

export default eventHandler(async (event) => {
    const auth = event.headers['authorization'];

    if (!auth) {
        setResponseStatus(event, 401);
        return {
            error: 'Unauthorized',
            message: 'No authorization header provided'
        };
    }

    const token = auth.split(' ')[1];
    const userToken = await prisma.token.findFirst({
        where: {
            token
        }
    });

    if (!userToken) {
        setResponseStatus(event, 401);
        return {
            error: 'Unauthorized',
            message: 'Invalid token'
        };
    }

    await prisma.token.delete({
        where: {
            token
        }
    });

    setResponseStatus(event,200);
    return {
        message: 'Logged out'
    };
});