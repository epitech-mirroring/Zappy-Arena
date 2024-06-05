import {getResponseStatus, getRouterParam, setResponseStatus} from "h3";
import {Group, User} from "@prisma/client";
import {prisma} from "~/database";
import {ErrorResponse, login} from "~/composables/users";
import {joinGroup} from "~/composables/groups";

export default eventHandler(async (event) => {
    const groupId = getRouterParam(event, 'group_id');
    if (!groupId) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid group id',
            message: 'Group id is required'
        };
    }

    const g: Group = await prisma.group.findFirst({
        where: {
            id: groupId
        }
    }) as Group;

    if (!g) {
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
        setResponseStatus(event, 400);
        return {
            error: 'Failed to join group',
            message: `Failed to join group with id ${groupId}`
        };
    }

    setResponseStatus(event, 200);
    return g;
});