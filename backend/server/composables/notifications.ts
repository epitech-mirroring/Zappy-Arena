import {User} from "@prisma/client";
import {prisma} from "~/database";
import {client} from "~/posthog";

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export type NotificationParams = {
    type: NotificationType,
    icon: string,
}

export const sendNotification = async (target: User, message: string, url?: string, params?: NotificationParams) => {

    client.capture({
        distinctId: target.id,
        event: 'notification',
        properties: {
            message,
            url,
            params
        }
    });

    await prisma.notification.create({
        data: {
            userId: target.id,
            message: message,
            read: false,
            redirectUrl: url || '',
            type: params?.type || 'info',
            icon: params?.icon || 'info'
        }
    });
}