import {getHeader, setResponseStatus} from "h3";
import {client} from "~/posthog";
import { refreshToken } from "~/composables/auth";

export default eventHandler(async (event) => {
    const userId = event.context.uniqueId;
    const authorization = getHeader(event, 'Authorization');

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'refresh',
    });

    if (!authorization) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'refresh_error',
            properties: {
                error: 'Unauthorized',
                reason: 'No authorization header'
            }
        });
        setResponseStatus(event, 401);
        return {
            error: 'Unauthorized',
            message: 'No authorization header'
        };
    }

    const oldRefreshToken = authorization.split(' ')[1];

    if (!oldRefreshToken) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'refresh_error',
            properties: {
                error: 'Unauthorized',
                reason: 'No refresh token'
            }
        });
        setResponseStatus(event, 401);
        return {
            error: 'Unauthorized',
            message: 'No refresh token'
        };
    }

    const refreshed = await refreshToken(oldRefreshToken);

    if (!refreshed) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'refresh_error',
            properties: {
                error: 'Unauthorized',
                reason: 'Invalid refresh token'
            }
        });
        setResponseStatus(event, 401);
        return {
            error: 'Unauthorized',
            message: 'Invalid refresh token'
        };
    }


    client.capture({
        distinctId: userId || 'anonymous',
        event: 'refresh_success',
    });

    setResponseStatus(event,200);
    return refreshed;
});