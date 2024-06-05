import {readBody} from "h3";
import {User} from "@prisma/client";
import {ErrorResponse, login} from "~/composables/users";
import {prisma} from "~/database";
import {inviteInGroup} from "~/composables/groups";
import {sendNotification} from "~/composables/notifications";

export default eventHandler(async (event) => {
    const body = await readBody(event);
    const loginResult: User | ErrorResponse = await login(event);
    if (getResponseStatus(event) !== 200) {
        return loginResult;
    }
    const user = loginResult as User;

    if (!body) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Body is required'
        };
    }

    const {email} = body as {email: string};

    if (!email) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Email is required'
        };
    }

    if (!user.groupId) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid group',
            message: 'You must be in a group to invite users'
        };
    }

    const userGroup = await prisma.group.findFirst({
        where: {
            id: user.groupId
        }
    });

    const targetUser = await prisma.user.findFirst({
        where: {
            email
        }
    });

    if (!targetUser) {
        setResponseStatus(event, 404);
        return {
            error: 'User not found',
            message: 'User with email not found'
        };
    }

    if (targetUser.groupId) {
        setResponseStatus(event, 400);
        return {
            error: 'User already in group',
            message: 'User is already in a group'
        };
    }

    if (await inviteInGroup(targetUser, userGroup)) {
        await sendNotification(user, 'Invitation sent', '/groups/invites', {type: 'success', icon: 'check'});

        setResponseStatus(event, 200);
        return {
            message: 'Invitation sent'
        };
    } else {
        setResponseStatus(event, 400);
        return {
            error: 'Invitation failed',
            message: 'Invitation failed'
        };
    }
});

