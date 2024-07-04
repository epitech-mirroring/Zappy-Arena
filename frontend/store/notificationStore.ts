import { defineStore } from "pinia";
import type {PostHog} from "posthog-js";


export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        notifications: [] as Notification[],
        sse: null as EventSource | null
    }),
    actions: {
        pushNotification(notification: TempNotification) {
            if (!notification.id)
                notification.id = Math.floor(Math.random() * 1000000)
            const finalNotification: Notification = {
                id: notification.id,
                message: notification.message,
                type: notification.type,
                duration: notification.duration,
                persist: notification.persist || false,
                read: notification.read || false,
                open: notification.open || true,
                url: notification.url
            }
            this.notifications.unshift(finalNotification)
            if (finalNotification.duration) {
                setTimeout(() => {
                    this.closeNotification(finalNotification.id)
                }, finalNotification.duration)
            }
        },
        readNotification(id: number | string) {
            this.notifications = this.notifications.map(n => {
                if (n.id === id) {
                    n.read = true
                }
                return n
            })
        },
        readAllNotifications() {
            this.notifications = []
        },
        readToggleNotification(id: number | string) {
            this.notifications = this.notifications.map(n => {
                if (n.id === id) {
                    n.read = !n.read
                }
                return n
            })
        },
        deleteNotification(id: number | string) {
            this.notifications = this.notifications.filter(n => n.id !== id)
        },
        deleteAllNotifications() {
            this.notifications = []
        },
        closeNotification(id: number | string) {
            this.notifications = this.notifications.map(n => {
                if (n.id === id) {
                    n.open = false
                    if (!n.persist) {
                        setTimeout(() => {
                            this.deleteNotification(n.id)
                        }, 500)
                    }
                }
                return n
            })
        },
        unsubscribeNotifications() {
            if (this.sse) {
                this.sse.close()
            }
            this.notifications = []
        },
        subscribeToNotifications(jwt: string) {
            // Subscribe to notifications
            const nuxt = useNuxtApp()
            const uniqueId = nuxt.$posthog() ? (nuxt.$posthog() as unknown as PostHog).get_distinct_id() : 'anonymous'
            this.unsubscribeNotifications()
            this.sse = new EventSource(nuxt.$config.public.apiHost + '/sse/notifications?slt=' + jwt)

            const start = new Date()

            this.sse.onmessage = (event) => {
                if (event.data === 'connected') {
                    return
                }

                const notification = JSON.parse(event.data) as {
                    id: string;
                    message: string;
                    createdAt: Date;
                    url: string;
                    type: NotificationType;
                    icon: string;
                    read?: boolean;
                }
                // If the notification is older than the connection, hide it
                const isOpened = new Date(notification.createdAt) > start
                this.pushNotification({
                    id: notification.id,
                    message: notification.message,
                    type: notification.type,
                    duration: 5000,
                    persist: true,
                    open: isOpened,
                    read: notification.read || false,
                    url: notification.url
                })
            }
        }
    },
    getters: {
        getNotifications(): Notification[] {
            return this.notifications
        },
        getOpenNotifications(): Notification[] {
            return this.notifications.filter(n => n.open)
        },
        getUnreadNotifications(): Notification[] {
            return this.notifications.filter(n => !n.read)
        },
        getLatestNotification(): Notification | undefined {
            return this.notifications[this.notifications.length - 1]
        },
        getUnreadPersistantNotifications(): Notification[] {
            return this.notifications.filter(n => !n.read && n.persist)
        },
        getPersistantNotifications(): Notification[] {
            return this.notifications.filter(n => n.persist)
        }
    }
})

export type NotificationType = "success" | "error" | "info" | "warning"

export type TempNotification = {
    id?: number | string;
    message: string;
    type: NotificationType;
    duration?: number;
    persist?: boolean;
    open?: boolean;
    read?: boolean;
    url?: string;
}

export type Notification = {
    id: number | string;
    message: string;
    type: NotificationType;
    duration?: number;
    read: boolean;
    open: boolean;
    persist: boolean;
    url?: string;
}

export const notificationTheme: Record<NotificationType, { text: string, icon: string, background: string, border: string }> =  {
    "success": {
        icon: "check-circle",
        background: "bg-green-100",
        border: "border-green-300",
        text: "text-green-700"
    },
    "error": {
        icon: "exclamation-circle",
        background: "bg-red-100",
        border: "border-red-300",
        text: "text-red-700"
    },
    "info": {
        icon: "info-circle",
        background: "bg-blue-100",
        border: "border-blue-300",
        text: "text-blue-700"
    },
    "warning": {
        icon: "exclamation-triangle",
        background: "bg-yellow-100",
        border: "border-yellow-300",
        text: "text-yellow-700"
    }
}