<script setup lang="ts">

import {useAccount} from "~/store/accountStore";

definePageMeta({
  title: 'Dashboard',
  description: 'Dashboard page',
  image: '/assets/logo.png',
  url: 'https://zappy-arena.com/dashboard',
  layout: 'dashboard',
});

const accountStore = useAccount();

const leagues = [
  { name: 'Iron' , logo: '/_nuxt/assets/leagues/rank_1', locked: false},
  { name: 'Copper' , logo: '/_nuxt/assets/leagues/rank_2', locked: false},
  { name: 'Silver' , logo: '/_nuxt/assets/leagues/rank_3', locked: false},
  { name: 'Palladium' , logo: '/_nuxt/assets/leagues/rank_4', locked: true},
  { name: 'Gold' , logo: '/_nuxt/assets/leagues/rank_5', locked: true},
  { name: 'Platinum', logo: '/_nuxt/assets/leagues/rank_6', locked: true}
]

</script>

<template>
  <div id="dashboard">
    <header>
      <h1>Welcome, {{ accountStore.getUser?.name }} 👋</h1>
    </header>
    <main>
      <div class="card" id="leagues-card">
        <div class="card-title">
          <h2>Leagues</h2>
        </div>
        <div class="card-content">
          <div id="league-progress-bar">
            <div id="league-progress-bar-fill"></div>
          </div>
          <div id="leagues">
            <div class="league" v-for="league in leagues">
              <img :src="league.logo + (league.locked ? '_locked' : '') + '.png' " alt="league.name" />
              <span>{{ league.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card" id="bots-card">
        <div class="card-title">
          <h2>Bots</h2>
        </div>
        <div class="card-content">
        </div>
      </div>
      <div class="card" id="matches-card">
        <div class="card-title">
          <h2>Match History</h2>
        </div>
        <div class="card-content">
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss">
#dashboard {
  @apply flex flex-col;
  @apply w-full h-full;
  @apply bg-black;

  header {
    @apply flex flex-row items-center justify-between;
    @apply w-full;
    @apply p-4;
    @apply bg-black;

    h1 {
      @apply text-3xl text-white;
      @apply font-bold;
      font-family: ZillaSlab-Bold, Montserrat, Roboto, sans-serif;
    }
  }

  main {
    @apply grid grid-cols-4 gap-4 grid-rows-3;
    @apply w-full h-full;
    @apply p-4;

    .card {
      @apply bg-white;
      @apply rounded-lg;
      @apply p-4;
      @apply shadow-lg;
      @apply bg-opacity-10;
      @apply border border-white border-opacity-10;

      .card-title {
        @apply flex flex-row items-center justify-between;
        @apply w-full;

        h2 {
          @apply text-xl text-white;
          @apply font-bold;
          font-family: RacingSansOne-Regular, Montserrat, Roboto, sans-serif;
        }
      }

      .card-content {
        @apply w-full;
        height: calc(100% - 2rem);
      }
    }

    #leagues-card {
      @apply col-span-3 row-span-1;
      @apply relative;

      #league-progress-bar {
        @apply absolute;
        @apply h-4 bg-white bg-opacity-20;
        width: calc(100% - 5rem);
        @apply rounded-full;
        @apply overflow-hidden;
        @apply top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
        @apply z-0;

        #league-progress-bar-fill {
          @apply bg-gradient-to-r from-green-400 to-yellow-500;
          @apply h-full;
          @apply w-1/2;
          @apply z-10;
        }
      }

      #leagues {
        @apply flex flex-row items-center justify-between;
        @apply pr-10;
        @apply w-full h-full;
        @apply z-20;

        .league {
          @apply flex flex-col items-center justify-center;
          @apply w-fit h-fit;
          @apply z-20;

          img {
            @apply w-16 aspect-square;
          }

          span {
            @apply text-white;
            font-family: RacingSansOne-Regular, Montserrat, Roboto, sans-serif;
          }
        }
      }
    }

    #bots-card {
      @apply col-span-1 row-span-2;
    }

    #matches-card {
      @apply col-span-3 row-span-2;
    }
  }
}
</style>