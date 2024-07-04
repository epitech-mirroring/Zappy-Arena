import {readBody} from "h3";
import {User} from "@prisma/client";
import {prisma} from "~/database";
import {inviteInGroup} from "~/composables/groups";
import {sendNotification} from "~/composables/notifications";
import {client} from "~/posthog";

export default eventHandler(async (event) => {
    const body = await readBody(event);
    const user = event.context.user as User;


    client.capture({
        distinctId: user.id,
        event: 'group_invite',
        properties: {
            body
        }
    });

    if (!body) {
        client.capture({
            distinctId: user.id,
            event: 'group_invite_error',
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

    const {email} = body as {email: string};

    if (!email) {
        client.capture({
            distinctId: user.id,
            event: 'group_invite_error',
            properties: {
                error: 'Invalid body',
                reason: 'Email is required'
            }
        });
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Email is required'
        };
    }

    if (!user.groupId) {
        client.capture({
            distinctId: user.id,
            event: 'group_invite_error',
            properties: {
                error: 'Invalid group',
                reason: 'You must be in a group to invite users'
            }
        });
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
        client.capture({
            distinctId: user.id,
            event: 'group_invite_error',
            properties: {
                error: 'User not found',
                reason: 'User with email not found'
            }
        });
        setResponseStatus(event, 404);
        return {
            error: 'User not found',
            message: 'User with email not found'
        };
    }

    if (targetUser.groupId) {
        client.capture({
            distinctId: user.id,
            event: 'group_invite_error',
            properties: {
                error: 'User already in group',
                reason: 'User is already in a group',
                targetUserId: targetUser.id
            }
        });
        setResponseStatus(event, 400);
        return {
            error: 'User already in group',
            message: 'User is already in a group'
        };
    }

    if (await inviteInGroup(targetUser, userGroup)) {
        client.capture({
            distinctId: user.id,
            event: 'group_invite_success',
            properties: {
                targetUserId: targetUser.id,
                groupId: userGroup.id
            }
        });
        await sendNotification(user, 'Invitation sent', '/groups/invites', {type: 'success', icon: 'check'});

        setResponseStatus(event, 200);
        return {
            message: 'Invitation sent'
        };
    } else {
        client.capture({
            distinctId: user.id,
            event: 'group_invite_error',
            properties: {
                error: 'Invitation failed',
                reason: 'Invitation failed',
                targetUserId: targetUser.id,
                groupId: userGroup.id
            }
        });
        setResponseStatus(event, 400);
        return {
            error: 'Invitation failed',
            message: 'Invitation failed'
        };
    }
});

