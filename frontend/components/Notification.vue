<script lang="ts" setup>
  import {
    notificationTheme,
    useNotificationStore
  } from "~/store/notificationStore";
  import type {Notification} from "~/store/notificationStore";

  const props = defineProps<{
    notification: Notification;
  }>();
  const store = useNotificationStore();
</script>

<template>
  <div class="notification" :class="[notificationTheme[notification.type].background, notificationTheme[notification.type].text, notificationTheme[notification.type].border]">
    <div class="notification-left">
      <i :class="'fas fa-' + notificationTheme[notification.type].icon" />
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
      @apply flex flex-row items-center justify-center flex-nowrap whitespace-nowrap overflow-x-hidden overflow-y-visible;
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