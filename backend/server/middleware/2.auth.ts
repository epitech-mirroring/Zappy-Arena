import {getRequestURL} from "h3";
import {client} from "~/posthog";
import {validateAccessToken} from "~/composables/auth";

const routes = [
    '/groups/invite',
    '/groups/create',
    '/groups/[group_id]/join',
    '/sse/notifications',
]

export default defineEventHandler(async (event) => {
    const url = getRequestURL(event)
    let posthogUniqueId = getHeader(event, 'X-User-Id');
    if (!posthogUniqueId) {
        posthogUniqueId = 'anonymous';
    }

    if (!routes.includes(url.pathname)) {
        event.context.uniqueId = posthogUniqueId
        return
    }

    const authorization = getHeader(event, 'Authorization') || getQuery(event).token as string | undefined;
    if (!authorization) {
        client.capture({
            distinctId: posthogUniqueId,
            event: 'unauthorized_access',
            properties: {
                url: url.pathname
            }
        });
        setResponseStatus(event, 401);
        return {
            error: 'Unauthorized',
            message: 'You are not authorized to access this resource'
        };
    }
    const token = authorization.replace('Bearer ', '');

    const valid = await validateAccessToken(token);

    if (!valid) {
        client.capture({
            distinctId: posthogUniqueId,
            event: 'unauthorized_access',
            properties: {
                url: url.pathname
            }
        });
        setResponseStatus(event, 401);
        return {
            error: 'Unauthorized',
            message: 'You are not authorized to access this resource'
        };
    }

    event.context.user = valid;
    return;
});