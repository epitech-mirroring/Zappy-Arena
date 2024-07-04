import {prisma} from "~/database";
import {getHeader, setResponseStatus} from "h3";
import {Group, User} from "@prisma/client";
import {client} from "~/posthog";

export default eventHandler(async (event) => {
    const groups: (Group & {members: User[] })[] = await prisma.group.findMany() as any;
    const userId = event.context.uniqueId;

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        group.members = await prisma.user.findMany({
            where: {
                groupId: group.id
            }
        });

        group.members = group.members.map(user => {
            delete user.groupId;
            delete user.password;
            delete user.email;
            delete user.createdAt;
            delete user.updatedAt;
            return user;
        });
    }

    client.capture({
        distinctId: userId || 'anonymous',
        event: 'group_list'
    });

    setResponseStatus(event,200);
    return groups;
});