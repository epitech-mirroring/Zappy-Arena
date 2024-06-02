import {prisma} from "~/database";
import {setResponseStatus} from "h3";
import {Group, User} from "@prisma/client";

export default eventHandler(async (event) => {
    const groups: (Group & {members: User[] })[] = await prisma.group.findMany() as any;

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

    setResponseStatus(event,200);
    return groups;
});