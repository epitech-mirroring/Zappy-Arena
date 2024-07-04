<script setup lang="ts">

import {
  notificationTheme,
  useNotificationStore
} from "~/store/notificationStore";
import {useAccount} from "~/store/accountStore";
import SideNavItem from "~/components/SideNavItem.vue";

const notificationStore = useNotificationStore();
const accountStore = useAccount();
const isNotificationsSidebarOpen = ref(false);
const router = useRouter();


onMounted(() => {
  setTimeout(() => {
    if (!accountStore.isLoggedIn) {
      router.push('/auth/login?redirect=' + router.currentRoute.value.path);
    } else {
      successLogin();
    }
  }, 5000);
});
const successLogin = async () => {
  notificationStore.subscribeToNotifications(await accountStore.getSLT());
  notificationStore.pushNotification({
    id: 0,
    duration: 2000,
    type: 'success',
    message: 'Successfully logged in.'
  });
}

</script>

<template>
  <div id="dashboard-layout">
    <header>
      <div id="logo" @click="router.push('/')">
        <img src="~/assets/logo.png" alt="">
        <span>Zappy-Arena</span>
      </div>
      <div id="nav">
        <div id="actions">
          <div id="invite-cta">
            <span>Invite in your group</span>
            <i class="far fa-user-plus"></i>
          </div>
          <div id="informations" class="nav-button">
            <i class="fal fa-circle-info"></i>
          </div>
          <div id="notifications" class="nav-button" @click="isNotificationsSidebarOpen = !isNotificationsSidebarOpen">
            <i class="fal fa-bell"></i>
            <div v-if="notificationStore.getUnreadPersistantNotifications.length > 0" class="notification-badge">
              {{ notificationStore.getUnreadPersistantNotifications.length }}
            </div>
          </div>
        </div>
        <div id="account">
          <div id="account-main">
            <div id="name">
              <span>{{ accountStore.getUser?.name || 'Unknown' }}</span>
            </div>
            <div id="avatar">
              <img :src="'https://api.dicebear.com/9.x/big-smile/svg?seed=' + accountStore.getUser?.id + '&flip=true&radius=50&backgroundType=solid,gradientLinear&backgroundRotation=0,360,10,20,30,40,70,60,50,-360,-350,-340,-330,-320,-310,-300,-290,-280,-270,-250,-260,-230,-240,-220,-210,-200,-190,-180,-170,-160,-150,-140,-130,-120,-100,-110,-60,-70,-80,-90,-40,-50,-30,-10,-20,80,100,90,150,130,120,110,140,160,170,180,190,200,210,220,230,250,240,350,340,330,320,310,300,290,280,260,270&translateY=5&skinColor=a47539,c99c62,e2ba87,efcc9f,f5d7b1,ffe4c0&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4'" alt="">
            </div>
          </div>
          <div id="hidden-menu" class="nav-button hidden">
            <i class="fal fa-ellipsis-h"></i>
          </div>
        </div>
      </div>
    </header>
    <div id="content">
      <aside id="sidebar">
        <SideNavItem path="/dashboard" icon="planet-ringed" text="Dashboard" />
        <SideNavItem path="/dashboard/group" icon="people-group" text="Group" />
        <SideNavItem path="/dashboard/bots" icon="alien" text="Bots" />
        <SideNavItem path="/dashboard/matches" icon="swords-laser" text="Matches" />
        <client-only>
          <SideNavItem v-if="$posthog()?.isFeatureEnabled('replays')" path="/dashboard/replays" icon="film-canister" text="Replays" />
        </client-only>
      </aside>
      <main>
        <slot v-if="accountStore.isLoggedIn"></slot>
        <div v-else id="skeleton">
          <div class="skeleton-item large" />
          <div class="skeleton-item" />
          <div class="skeleton-item" />
          <div class="skeleton-item x-large" />
          <div class="skeleton-item" />
          <div class="skeleton-item large" />
          <div class="skeleton-item large" />
          <div class="skeleton-item" />
          <div class="skeleton-item tall" />
        </div>
      </main>
    </div>
    <Transition name="slide">
      <aside id="notifications-sidebar" v-if="isNotificationsSidebarOpen">
        <div id="notifications-actions">
          <button @click="notificationStore.readAllNotifications()" class="notification-action">
            <i class="fas fa-eye" />
            <span>Read all</span>
          </button>
          <button @click="notificationStore.deleteAllNotifications()" class="notification-action">
            <i class="fas fa-trash" />
            <span>Delete all</span>
          </button>
        </div>
        <div v-for="notification in notificationStore.getPersistantNotifications" :key="notification.id">
          <div class="notification" :class="notificationTheme[notification.type].text">
            <div class="notification-content">
              <i :class="'fas fa-' + notificationTheme[notification.type].icon" />
              <span class="notification-message">{{ notification.message }}</span>
            </div>
            <div class="notification-actions">
              <button class="notification-read-toggle" @click="notificationStore.readToggleNotification(notification.id)">
                <i :class="notification.read ? 'fas fa-eye' : 'fas fa-eye-slash'" />
              </button>
              <button class="notification-close" @click="notificationStore.deleteNotification(notification.id)">
                <i class="fas fa-times" />
              </button>
            </div>
          </div>
        </div>
        <div v-if="notificationStore.getPersistantNotifications.length === 0" id="no-notifications">
          <span>No notifications</span>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped lang="postcss">

.slide-enter-active, .slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}

#dashboard-layout {
  @apply flex flex-col items-start justify-start;
  @apply w-screen h-screen;
}

header {
  @apply flex flex-row justify-between items-center;
  @apply w-full h-16;
  @apply bg-white;
  @apply z-10;
  @apply bg-black;
  @apply border-b-2 border-gray-700;
  @apply px-3;

  #logo {
    @apply flex flex-row items-center;
    @apply select-none;
    @apply cursor-pointer;

    img {
      width: 59px;
      height: 47px;
    }

    span {
      @apply text-2xl text-white;
      @apply ml-2;
      @apply font-bold;
      font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
    }
  }

  #nav {
    @apply flex flex-row items-start justify-end;
    @apply w-1/2 h-full;
    @apply space-x-8 mt-4;

    .nav-button {
      @apply flex flex-row items-center justify-center;
      @apply w-12 h-12;
      @apply rounded-full;
      @apply bg-black bg-opacity-50;
      @apply text-white;
      @apply cursor-pointer;
    }

    #actions {
      @apply flex flex-row items-center;

      #invite-cta {
        @apply flex flex-row items-center justify-around;
        @apply gap-4;
        @apply cursor-pointer;
        @apply text-white;
        @apply px-4 py-1 overflow-hidden;
        @apply relative;
        @apply bg-black;
        --border-size: 4px;
        --border-radius: 18px;
        border-radius: var(--border-radius);

        &::after {
          content: '';
          @apply block;
          @apply absolute;
          @apply w-full h-full;
          @apply bg-gradient-to-r from-green-400 to-yellow-500;
          @apply z-0;
        }

        &::before {
          content: '';
          @apply block;
          @apply absolute;
          width: calc(100% - var(--border-size) * 2);
          height: calc(100% - var(--border-size) * 2);
          top: var(--border-size);
          left:  var(--border-size);
          border-radius: calc(var(--border-radius) - var(--border-size));
          @apply bg-black;
          @apply z-10;
          @apply transition-all duration-300 ease-in-out;
        }

        span {
          @apply font-bold;
          @apply z-20;
          @apply transition-all duration-300;
          font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
        }

        i {
          @apply transition-all duration-300;
          @apply z-20;
        }

        &:hover {
          @apply text-black;

          &::before {
            @apply w-0 h-0;
            @apply top-1/2 left-1/2;
          }
        }
      }

      #notifications {
        @apply relative;
      }

      .notification-badge {
        @apply absolute top-0 right-0;
        @apply w-6 h-6;
        @apply bg-red-500;
        @apply text-white;
        @apply rounded-full;
        @apply flex justify-center items-center;
        font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
      }

    }

    #account {
      @apply flex flex-col items-center justify-start;
      @apply space-x-6 h-fit w-fit;
      @apply cursor-pointer;
      @apply pl-4 pr-2 py-2;
      @apply bg-gray-300 bg-opacity-20;
      @apply rounded-[1.5rem];

      #account-main {
        @apply flex flex-row items-center justify-start;
        @apply gap-2;
        @apply w-fit h-full;
        @apply text-white;
        @apply transition duration-300 ease-in-out;

        &:hover {
          @apply bg-gray-300 bg-opacity-30;
        }


        #name {
          @apply text-white;
          @apply font-bold;
          @apply text-nowrap;
          font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
        }

        #avatar {
          @apply h-8 w-8;
          @apply rounded-full;
          @apply overflow-hidden;
        }
      }
    }
  }
}

#content {
  @apply flex flex-row items-start justify-start;
  @apply w-full;
  height: calc(100vh - 4rem);
  @apply bg-black;

  aside {
    @apply flex flex-col items-start justify-start;
    @apply w-fit h-full;
    @apply bg-black;
    @apply text-white;
    @apply border-r-2 border-gray-700;
  }

  main {
    @apply flex flex-col;
    @apply w-full;
    @apply h-full;
    @apply overflow-y-auto;

    #skeleton {
      @apply flex flex-wrap items-start justify-start;
      @apply w-full h-full;
      @apply p-4;
      @apply gap-x-4 gap-y-4;
      @apply overflow-hidden;

      .skeleton-item {
        height: calc(25% - 2rem);
        width: calc(25% - 1rem);
        @apply rounded-md;
        animation: pulse 1.5s infinite ease-in-out;

        &.large {
          width: calc(50% - 1rem);
        }

        &.x-large {
          width: calc(100% - 1rem);
        }

        &.tall {
          height: calc(50% - 3rem);
          width: calc(25% - 1rem);
          transform: translateY(calc(-50% - 0.5rem));
        }
      }

      @for $i from 1 to 10 {
        .skeleton-item:nth-child($i) {
          animation-delay: calc(0.1s * $i);
        }
      }
    }
  }
}

@keyframes pulse {
  0% {
    background-color: rgba(255, 255, 255, 0.1);
  }
  50% {
    background-color: rgba(255, 255, 255, 0.2);
  }
  100% {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

#notifications-sidebar {
  @apply w-80;
  height: calc(100vh - 4rem);
  @apply fixed top-16 right-0;
  @apply bg-white bg-opacity-10 backdrop-blur-lg;
  @apply overflow-x-hidden overflow-y-auto;

  #notifications-actions {
    @apply flex flex-row items-center justify-around;
    @apply w-full h-auto;
    @apply px-4 py-2;
    @apply bg-black bg-opacity-20;
    @apply border-b-2 border-gray-700;

    .notification-action {
      @apply flex flex-row items-center justify-center;
      @apply w-fit h-full;
      @apply cursor-pointer;
      @apply text-white;
      @apply bg-black bg-opacity-50;
      @apply rounded-full;
      @apply transition duration-300 ease-in-out;
      @apply gap-4;
      @apply px-4 py-1;

      i {
        @apply text-xl;
      }

      span {
        @apply font-bold;
        font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
      }

      &:hover {
        @apply bg-white bg-opacity-10;
      }
    }
  }

  .notification {
    @apply flex flex-row items-center justify-between;
    @apply w-full h-12 px-2;
    @apply border-b-2;
    @apply gap-2;

    .notification-content {
      @apply flex flex-row items-center justify-start flex-grow-0;
      @apply w-3/4 gap-2;

      .notification-message {
        @apply whitespace-nowrap overflow-hidden text-ellipsis;
      }
    }

    .notification-actions {
      @apply flex flex-row items-center justify-center flex-shrink-0;
      @apply gap-2;
      @apply w-auto h-full;
      @apply text-gray-500;

      .notification-read-toggle {
        @apply flex flex-row items-baseline justify-center;
        @apply pointer-events-auto cursor-pointer;
        @apply transition duration-300 ease-in-out;
        @apply hover:text-green-500;
      }

      .notification-close {
        @apply flex flex-row items-baseline justify-center;
        @apply pointer-events-auto cursor-pointer;
        @apply transition duration-300 ease-in-out;
        @apply hover:text-red-500;
      }
    }
  }

  #no-notifications {
    @apply flex flex-row items-center justify-center;
    @apply w-full h-12;
    @apply text-white;
    font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
  }
}

</style>