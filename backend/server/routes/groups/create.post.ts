import {getResponseStatus, readBody} from "h3";
import {prisma} from "~/database";
import {ErrorResponse, login} from "~/composables/users";
import {User} from "@prisma/client";

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

    if (!body) {
        setResponseStatus(event, 400);
        return {
            error: 'Invalid body',
            message: 'Body is required'
        };
    }

    const {name} = body as GroupCreateBody;

    if (!name) {
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


    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            groupId: group.id
        }
    });

    setResponseStatus(event, 200);
    return group;
});