import {getHeader, setResponseStatus} from "h3";
import {prisma} from "~/database";
import {client} from "~/posthog";

export default eventHandler(async (event) => {
    const auth = getHeader(event, 'Authorization');
    const userId = getHeader(event, 'X-User-Id');

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'logout',
        properties: {
            auth
        }
    });
    if (!auth) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'logout_error',
            properties: {
                error: 'No authorization header provided'
            }
        });
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
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'logout_error',
            properties: {
                error: 'Invalid token'
            }
        });
        setResponseStatus(event, 401);
        return {
            error: 'Unauthorized',
            message: 'Invalid token'
        };
    }

    client.capture({
        distinctId: userToken.userId,
        event: 'logout_success'
    });

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