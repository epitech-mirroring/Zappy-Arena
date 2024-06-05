import {Group, User} from "@prisma/client";
import {sendNotification} from "~/composables/notifications";
import {prisma} from "~/database";

export const inviteInGroup = async (target: User, group: Group): Promise<boolean> => {

    // Check if user is not already invited
    const isAlreadyInvited = await prisma.groupInvitation.findFirst({
        where: {
            userId: target.id,
            groupId: group.id,
            status: "pending"
        }
    });

    if (isAlreadyInvited) {
        return false;
    }

    await sendNotification(target, 'You have been invited to join a group. Accept the invitation to join the group.',
        `/groups/${group.id}/join`, {type: 'info', icon: 'people-group'});

    await prisma.groupInvitation.create({
        data: {
            userId: target.id,
            groupId: group.id,
            status: "pending"
        }
    });

    return true;
}

export const joinGroup = async (user: User, group: Group): Promise<boolean> => {
    // Check if user is not already in a group
    if (user.groupId) {
        return false;
    }

    // Check if user has a pending invitation
    const invitation = await prisma.groupInvitation.findFirst({
        where: {
            userId: user.id,
            groupId: group.id,
            status: "pending"
        }
    });

    if (!invitation) {
        return false;
    }

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            groupId: group.id
        }
    });

    await prisma.groupInvitation.delete({
        where: {
            id: invitation.id
        }
    });

    await sendNotification(user, 'You have joined the group successfully.', `/groups/${group.id}`, {type: 'success', icon: 'check'});
    return true;
}

export const declineGroup = async (user: User, group: Group): Promise<boolean> => {
    // Check if user has a pending invitation
    const invitation = await prisma.groupInvitation.findFirst({
        where: {
            userId: user.id,
            groupId: group.id,
            status: "pending"
        }
    });

    if (!invitation) {
        return false;
    }

    await prisma.groupInvitation.delete({
        where: {
            id: invitation.id
        }
    });

    await sendNotification(user, 'You have declined the invitation.', '/groups', {type: 'warning', icon: 'people-group'});
    return true;
}

export const leaveGroup = async (user: User): Promise<boolean> => {
    // Check if user is in a group
    if (!user.groupId) {
        return false;
    }

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            groupId: null
        }
    });

    await sendNotification(user, 'You have left the group successfully.', '/groups', {type: 'success', icon: 'check'});
    return true;
}

export const removeUserFromGroup = async (user: User, group: Group): Promise<boolean> => {
    // Check if user is in a group
    if (user.groupId !== group.id) {
        return false;
    }

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            groupId: null
        }
    });

    await sendNotification(user, 'You have been removed from the group.', '/groups', {type: 'error', icon: 'people-group'});
    return true;
}
