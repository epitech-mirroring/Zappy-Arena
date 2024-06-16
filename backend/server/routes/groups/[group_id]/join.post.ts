import {
    getHeader,
    getResponseStatus,
    getRouterParam,
    setResponseStatus
} from "h3";
import {Group, User} from "@prisma/client";
import {prisma} from "~/database";
import {ErrorResponse, login} from "~/composables/users";
import {joinGroup} from "~/composables/groups";
import {client} from "~/posthog";

export default eventHandler(async (event) => {
    const groupId = getRouterParam(event, 'group_id');
    const userId = getHeader(event, 'X-User-Id');
    if (!groupId) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid group id',
            message: 'Group id is required'
        };
    }

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'group_join',
        properties: {
            groupId
        }
    });

    const g: Group = await prisma.group.findFirst({
        where: {
            id: groupId
        }
    }) as Group;

    if (!g) {
        client.capture({
            distinctId: userId || 'anonymous',
            event: 'group_join_error',
            properties: {
                error: 'Group not found',
                reason: `Group with id ${groupId} not found`
            }
        });
        setResponseStatus(event, 404);
        return {
            error: 'Group not found',
            message: `Group with id ${groupId} not found`
        };
    }


    const loginResult: User | ErrorResponse = await login(event);
    if (getResponseStatus(event) !== 200) {
        return loginResult;
    }
    const user = loginResult as User;

    if (!await joinGroup(user, g)) {
        client.capture({
            distinctId: user.id,
            event: 'group_join_error',
            properties: {
                error: 'Failed to join group',
                reason: `Failed to join group with id ${groupId}`
            }
        });
        setResponseStatus(event, 400);
        return {
            error: 'Failed to join group',
            message: `Failed to join group with id ${groupId}`
        };
    }

    client.capture({
        distinctId: user.id,
        event: 'group_join_success',
        properties: {
            group: g
        }
    });

    setResponseStatus(event, 200);
    return g;
});