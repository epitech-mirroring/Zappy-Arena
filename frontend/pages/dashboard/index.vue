<script setup lang="ts">
import {useAccount} from "~/store/accountStore";

const accountStore = useAccount();
const router = useRouter();

onMounted(() => {
  if (!accountStore.isLoggedIn) {
    router.push('/auth/login?redirect=/dashboard');
  }
});

</script>

<template>
  <div>
    <h1>Dashboard</h1>
  </div>
</template>

<style scoped lang="postcss">

</style>