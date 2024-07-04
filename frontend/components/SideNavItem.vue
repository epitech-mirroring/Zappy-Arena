<script setup lang="ts">

import {useAccount} from "~/store/accountStore";

const props = defineProps<{
  icon: string;
  text: string;
  path: string;
}>();

const router = useRouter();
const selected = computed(() => router.currentRoute.value.path === props.path);
const accountStore = useAccount();

</script>

<template>
  <div :class="'sidebar-item' + (selected ? ' selected' : '')" @click="accountStore.isLoggedIn ? router.push(props.path) : ''">
    <i :class="'fa-duotone fa-fw fa-' + props.icon"></i>
    <span>{{ props.text }}</span>
  </div>
</template>

<style scoped lang="postcss">

.sidebar-item {
  @apply flex flex-row items-center justify-start;
  @apply gap-4 mr-4;
  @apply w-full h-16;
  @apply cursor-pointer;
  @apply select-none;

  &.selected {
    @apply bg-gradient-to-r from-green-400 to-yellow-500;
    @apply bg-clip-text text-transparent;

    i {
      --fa-primary-color: #fff;
      --fa-secondary-color: #4ade80;
    }

    &::before {
      @apply opacity-100;
      @apply bg-gradient-to-tr from-green-400 to-yellow-500;
    }
  }

  &:hover {
    @apply bg-white bg-opacity-10;
  }

  &::before {
    content: '';
    @apply block;
    @apply w-2 h-5/6;
    @apply bg-white;
    @apply opacity-0;
    @apply rounded-r-lg;
  }

  i {
    @apply text-4xl;
  }

  span {
    @apply text-2xl;
    @apply font-bold;
    font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
  }
}
</style>