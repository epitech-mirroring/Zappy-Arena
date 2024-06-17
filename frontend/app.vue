<template>
  <NotificationProvider />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
  font-family: 'RacingSansOne-Regular';
  src: url('~/assets/fonts/RacingSansOne-Regular.ttf');
}

@font-face {
  font-family: 'ZillaSlab-Regular';
  src: url('~/assets/fonts/ZillaSlab-Regular.ttf');
}

@font-face {
  font-family: 'ZillaSlab-Bold';
  src: url('~/assets/fonts/ZillaSlab-Bold.ttf');
}

@font-face {
  font-family: 'ZillaSlab-SemiBold';
  src: url('~/assets/fonts/ZillaSlab-SemiBold.ttf');
}

@font-face {
  font-family: 'ZillaSlab-Medium';
  src: url('~/assets/fonts/ZillaSlab-Medium.ttf');
}

@font-face {
  font-family: 'ZillaSlab-Light';
  src: url('~/assets/fonts/ZillaSlab-Light.ttf');
}

@font-face {
  font-family: 'ZillaSlab-BoldItalic';
  src: url('~/assets/fonts/ZillaSlab-BoldItalic.ttf');
}

@font-face {
  font-family: 'ZillaSlab-SemiBoldItalic';
  src: url('~/assets/fonts/ZillaSlab-SemiBoldItalic.ttf');
}

@font-face {
  font-family: 'ZillaSlab-MediumItalic';
  src: url('~/assets/fonts/ZillaSlab-MediumItalic.ttf');
}

@font-face {
  font-family: 'ZillaSlab-LightItalic';
  src: url('~/assets/fonts/ZillaSlab-LightItalic.ttf');
}

@font-face {
  font-family: 'ZillaSlab-SemiBoldItalic';
  src: url('~/assets/fonts/ZillaSlab-SemiBoldItalic.ttf');
}

@font-face {
  font-family: 'PlayfairDisplay';
  src: url('~/assets/fonts/PlayfairDisplay-VariableFont_wght.ttf');
}

@font-face {
  font-family: 'PlayfairDisplay-Italic';
  src: url('~/assets/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf');
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus,
select:-webkit-autofill,
select:-webkit-autofill:hover,
select:-webkit-autofill:focus {
  border: 1px solid #253341;
  -webkit-text-fill-color: white;
  -webkit-box-shadow: 0 0 0px 1000px #253341 inset;
  box-shadow: 0 0 0px 1000px #253341 inset;
  transition: background-color 5000s ease-in-out 0s;
  color: white;
}
</style>
<script setup lang="ts">
import NotificationProvider from "~/components/NotificationProvider.vue";
</script>