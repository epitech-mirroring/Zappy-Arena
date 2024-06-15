<script setup lang="ts">

import NotificationProvider from "~/components/NotificationProvider.vue";
import {useNotificationStore} from "~/store/notificationStore";
import {useAccount} from "~/store/accountStore";

const email = ref('');
const password = ref('');
const emailRegex = new RegExp('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$');
const isEmailValid = ref(false);
const notificationStore = useNotificationStore();
const accountStore = useAccount();

const checkEmail = () => {
  isEmailValid.value = emailRegex.test(email.value);
}

const tryLogin = async () => {
  if (email.value === '' || password.value === '') {
    notificationStore.pushNotification({
      id: 0,
      duration: 2000,
      type: 'error',
      message: 'Please fill in all fields.'
    });
    return;
  }

  if (!isEmailValid.value) {
    notificationStore.pushNotification({
      id: 0,
      duration: 2000,
      type: 'error',
      message: 'Please enter a valid email address.'
    });
    return;
  }

  const msg = await accountStore.login(email.value, password.value);
  if (msg) {
    notificationStore.pushNotification({
      id: 0,
      duration: 2000,
      type: 'error',
      message: msg
    });
  }
}


</script>

<template>
  <NotificationProvider />
  <main id="body">
    <img src="~/assets/auth-bg.png" alt="" />
    <div id="login">
      <div id="login-card">
        <div id="login-card-header">
          <div id="login-card-header-title">
            Zappy-Arena
          </div>
          <div id="login-card-header-subtitle">
            Login
          </div>
        </div>
        <div id="login-card-body">
          <div id="login-card-body-inputs">
            <div class="input-group">
              <label for="username">
                <i class="fas fa-user"></i>
                Email
              </label>
              <input type="text" id="email" placeholder="john.wick@epitech.eu" v-model="email" @input="checkEmail" :class="{ 'invalid': !isEmailValid }" />
            </div>
            <div class="input-group">
              <label for="password">
                <i class="fas fa-lock"></i>
                Password
              </label>
              <input type="password" id="password" placeholder="D0n!TouChMyD0G" v-model="password" @keyup.enter="tryLogin" />
            </div>
          </div>
          <div id="login-card-body-actions">
            <button id="login-card-body-actions-login" @click="tryLogin">Login</button>
          </div>
          <div id="login-card-body-subactions">
            <span>Don't have an account?</span>
            <button id="login-card-body-subactions-signup" @click="navigateTo('/auth/signup')">Sign up</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="postcss">
  #body {
    @apply flex flex-col items-center justify-center;
    @apply h-screen w-screen;
    @apply relative;

    img {
      @apply absolute inset-0;
      @apply w-full h-full object-cover;
      @apply z-0;
    }

    #login {
      @apply z-10;
      @apply flex flex-row justify-center items-center;
      @apply w-fit h-fit;
      @apply bg-black bg-opacity-80;
      @apply rounded-xl;

      #login-card {
        @apply flex flex-col;
        @apply space-y-8;
        @apply w-96;
        @apply rounded-xl;
        @apply shadow-lg;
        @apply px-10;
        @apply py-10;

        #login-card-header {
          @apply flex flex-col justify-between items-center;
          @apply w-full;

          #login-card-header-title {
            @apply text-2xl text-white;
            @apply font-bold;
            font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
          }

          #login-card-header-subtitle {
            @apply text-lg text-white;
            @apply font-bold;
            font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
          }
        }

        #login-card-body {
          @apply flex flex-col;
          @apply w-full;

          #login-card-body-inputs {
            @apply flex flex-col;
            @apply w-full;

            .input-group {
              @apply flex flex-col;
              @apply w-full;
              @apply mb-4;

              label {
                @apply flex flex-row items-center;
                @apply gap-2;
                @apply text-white;
                @apply font-bold;
                @apply mb-2;
                font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
              }

              input {
                @apply w-full;
                @apply bg-white bg-opacity-25;
                @apply text-white;
                @apply p-2;
                @apply rounded-md;

                &.invalid {
                  @apply border-2 border-red-500;
                }
              }
            }
          }

          #login-card-body-actions {
            @apply flex flex-row justify-center items-center;
            @apply w-full;

            button {
              @apply w-1/2;
              @apply text-white;
              @apply p-2;
              @apply rounded-md;
              @apply font-bold;
              @apply border border-white;
              font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
              @apply cursor-pointer;
              @apply transition-all duration-300;

              &:hover, &:focus, &:active {
                @apply bg-white;
                @apply text-black;
              }
            }
          }

          #login-card-body-subactions {
            @apply flex flex-row justify-center items-center;
            @apply w-full;
            @apply mt-4;
            @apply text-white;
            font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;

            span {
              @apply mr-2;
            }

            button {
              @apply text-white;
              @apply font-bold;
              font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
              @apply cursor-pointer;
              @apply transition-all duration-300;

              &:hover, &:focus, &:active {
                @apply text-green-400;
              }
            }
          }
        }
      }
    }
  }
</style>