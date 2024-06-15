<template>
  <div id="notification-provider">
    <TransitionGroup name="notification" tag="ul" class="notifications">
      <li v-for="notification in store.getNotifications" :key="notification.id">
        <Notification :notification="notification" />
      </li>
    </TransitionGroup>
    <slot />
  </div>
</template>

<script lang="ts" setup>
  import Notification from "@/components/Notification.vue";
  import { useNotificationStore } from "@/store/notificationStore";

  const store = useNotificationStore();
</script>

<style lang="postcss" scoped>
  #notification-provider {
    @apply absolute top-0 right-0 w-screen h-screen pointer-events-none;

    .notifications {
      @apply absolute top-0 right-0 w-screen h-screen pointer-events-none;
      @apply flex flex-col items-end justify-start p-4 space-y-2;
      z-index: 9999;
    }

    .notification-enter-active, .notification-leave-active {
      transition: all 0.5s ease;
    }

    .notification-enter-from, .notification-leave-to {
      opacity: 0;
      transform: translateY(-100%);
    }
  }
</style>