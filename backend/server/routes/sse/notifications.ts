import {prisma} from "~/database";
import {Notification, User} from "@prisma/client";
import {timeout} from "ioredis/built/utils";

export default defineEventHandler(async (event) => {
    const user = event.context.user as User


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

    timeout(async () => {
        await eventStream.push('connected')

        // Push all notifications that were created before the connection
        const notifications: Notification[] = await prisma.notification.findMany({
            where: {
                userId: user.id,
            }
        })

        for (const notification of notifications) {
            await eventStream.push(JSON.stringify({
                id: notification.id,
                message: notification.message,
                createdAt: notification.createdAt,
                url: notification.redirectUrl,
                type: notification.type,
                icon: notification.icon,
                read: notification.read
            }))
        }

    }, 1000)

    return eventStream.send()
})