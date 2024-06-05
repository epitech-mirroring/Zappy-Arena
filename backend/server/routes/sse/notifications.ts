import {prisma} from "~/database";
import {Notification, User} from "@prisma/client";
import {timeout} from "ioredis/built/utils";
import {ErrorResponse, login} from "~/composables/users";

export default defineEventHandler(async (event) => {
    const loginResult: User | ErrorResponse = await login(event);
    if (getResponseStatus(event) !== 200) {
        return loginResult;
    }
    const user = loginResult as User;


    const eventStream = createEventStream(event, {autoclose: false})

    const interval = setInterval(async (user) => {
        const notifications: Notification[] = await prisma.notification.findMany({
            where: {
                userId: user.id,
                read: false
            }
        })

        for (const notification of notifications) {
            await eventStream.push(JSON.stringify({
                id: notification.id,
                message: notification.message,
                createdAt: notification.createdAt,
                url: notification.redirectUrl,
                type: notification.type,
                icon: notification.icon
            }))

            await prisma.notification.update({
                where: {
                    id: notification.id
                },
                data: {
                    read: true
                }
            })
        }
    }, 500, user)

    eventStream.onClosed(async () => {
        clearInterval(interval)
        await eventStream.close()
    })

    timeout(() => eventStream.push('connected'), 1000)

    return eventStream.send()
})