<script lang="ts" setup>
  import {useNotificationStore} from "~/store/notificationStore";
  import type {Notification} from "~/store/notificationStore";

  const props = defineProps<{
    notification: Notification;
  }>();
  const store = useNotificationStore();

  const notificationThemes = {
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
</script>

<template>
  <div class="notification" :class="[notificationThemes[notification.type].background, notificationThemes[notification.type].text, notificationThemes[notification.type].border]">
    <div class="notification-left">
      <i :class="'fas fa-' + notificationThemes[notification.type].icon" />
    </div>
    <div class="notification-center">
      <span class="notification-message">{{ props.notification.message }}</span>
    </div>
    <div class="notification-right">
      <button class="notification-close" @click="store.closeNotification(notification.id)">
        <i class="fas fa-times" />
      </button>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .notification {
    @apply flex flex-row items-center justify-center flex-grow;
    @apply w-auto h-12 p-4;
    @apply rounded-md shadow-md;
    @apply border shadow-md;

    .notification-left {
      @apply flex flex-row items-center justify-center;
      @apply w-auto;
      @apply mr-2;
    }

    .notification-center {
      @apply flex flex-row items-center justify-center flex-nowrap whitespace-nowrap overflow-hidden;
      @apply w-full h-full;
      @apply mr-4;
    }

    .notification-right {
      @apply flex flex-row items-center justify-center;
      @apply w-auto h-full;

      .notification-close {
        @apply flex flex-row items-baseline justify-center;
        @apply pointer-events-auto cursor-pointer;
        @apply transition duration-300 ease-in-out;
        @apply hover:text-red-500;
      }
    }
  }
</style>