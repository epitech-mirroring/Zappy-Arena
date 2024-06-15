import { defineStore } from "pinia";


export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        notifications: [] as Notification[],
    }),
    actions: {
        pushNotification(notification: Notification) {
            notification.id = Math.floor(Math.random() * 1000000)
            this.notifications.unshift(notification)
            if (notification.duration) {
                setTimeout(() => {
                    this.closeNotification(notification.id)
                }, notification.duration)
            }
        },
        closeNotification(id: number) {
            this.notifications = this.notifications.filter(n => n.id !== id)
        },
        closeAllNotifications() {
            this.notifications = []
        }
    },
    getters: {
        getNotifications(): Notification[] {
            return this.notifications
        },
        getLatestNotification(): Notification | undefined {
            return this.notifications[this.notifications.length - 1]
        }
    }
})

export type Notification = {
    id: number;
    message: string;
    type: "success" | "error" | "info" | "warning";
    duration: number;
}
