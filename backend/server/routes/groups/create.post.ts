import {getResponseStatus, readBody} from "h3";
import {prisma} from "~/database";
import {ErrorResponse, login} from "~/composables/users";
import {User} from "@prisma/client";
import {client} from "~/posthog";
import {sendNotification} from "~/composables/notifications";

type GroupCreateBody = {
    name: string;
};

export default eventHandler(async (event) => {
    const body = await readBody(event);
    const loginResult: User | ErrorResponse = await login(event);
    if (getResponseStatus(event) !== 200) {
        return loginResult;
    }
    const user = loginResult as User;

    client.capture({
        distinctId: user.id,
        event: 'group_create',
        properties: {
            body
        }
    });
    if (!body) {
        client.capture({
            distinctId: user.id,
            event: 'group_create_error',
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

    const {name} = body as GroupCreateBody;

    if (!name) {
        client.capture({
            distinctId: user.id,
            event: 'group_create_error',
            properties: {
                error: 'Invalid body',
                reason: 'Name is required'
            }
        });
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Name is required'
        };
    }

    const group = await prisma.group.create({
        data: {
            name
        }
    });

    client.capture({
        distinctId: user.id,
        event: 'group_create_success',
        properties: {
            group
        }
    });


    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            groupId: group.id
        }
    });

    await sendNotification(user, `Group ${group.name} created`, `/groups/${group.id}`, {
        type: 'success',
        icon: 'check-circle'
    });

    setResponseStatus(event, 200);
    return group;
});