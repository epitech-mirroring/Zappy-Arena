<script setup lang="ts">

const router = useRouter();

definePageMeta({
  title: 'Dashboard - Replays',
  description: 'The replays of your matches',
  image: '/assets/logo.png',
  url: 'https://zappy-arena.com/dashboard/replays',
  layout: 'dashboard',
  validate() {
    if (import.meta.client) { // Client only code
      const nuxt = useNuxtApp();
      if (nuxt.$posthog) {
        const posthog = nuxt.$posthog()!;
        if (!posthog.isFeatureEnabled('replays')) {
          return false;
        }
      }
    }
    return true;
  },
});

</script>

<template>
  <div>
    <h1>Dashboard</h1>
  </div>
</template>

<style scoped lang="postcss">

</style>