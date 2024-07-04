<script setup lang="ts">

import {useAccount} from "~/store/accountStore";

const accountStore = useAccount();

const scrollTo = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

const openDocumentation = () => {
  window.open('https://github.com/epitech-mirroring/Zappy-Arena', '_blank');
}

const openAuthor = () => {
  window.open('https://bento.me/axeleck', '_blank');
}

const openEpitech = () => {
  window.open('https://www.epitech.eu/', '_blank');
}

</script>

<template>
  <div id="body">
    <header>
      <div id="header-logo">
        <img src="~/assets/logo.png"  alt=""/>
        <span id="header-logo-text">
          Zappy-Arena
        </span>
      </div>
      <div id="right">
        <div id="menu">
          <div class="menu-item" @click="scrollTo('groups')">
            <span>Groups</span>
          </div>
          <div class="menu-item" @click="scrollTo('leagues')">
            <span>Leagues</span>
          </div>
          <div class="menu-item" @click="openDocumentation">
            <span>Documentation</span>
            <i class="fa-light fa-external-link-alt"></i>
          </div>
        </div>
        <div id="auth">
          <div v-if="!accountStore.isLoggedIn" id="login" class="auth-item" @click="navigateTo('/auth/login')">
            <span>Login</span>
          </div>
          <div v-if="!accountStore.isLoggedIn" id="signup" class="auth-item" @click="navigateTo('/auth/signup')">
            <span>Sign up</span>
          </div>
          <div v-else id="dashboard" class="auth-item" @click="navigateTo('/dashboard')">
            <span>Dashboard</span>
            <img id='avatar' :src="'https://api.dicebear.com/9.x/big-smile/svg?seed=' + accountStore.getUser?.id + '&flip=true&radius=50&backgroundType=solid,gradientLinear&backgroundRotation=0,360,10,20,30,40,70,60,50,-360,-350,-340,-330,-320,-310,-300,-290,-280,-270,-250,-260,-230,-240,-220,-210,-200,-190,-180,-170,-160,-150,-140,-130,-120,-100,-110,-60,-70,-80,-90,-40,-50,-30,-10,-20,80,100,90,150,130,120,110,140,160,170,180,190,200,210,220,230,250,240,350,340,330,320,310,300,290,280,260,270&translateY=5&skinColor=a47539,c99c62,e2ba87,efcc9f,f5d7b1,ffe4c0&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4'" alt="">
          </div>
        </div>
      </div>
    </header>
    <main>
      <section id="hero">
        <span>Unleash The Trantorians</span>
        <img src="~/assets/hero.webp" alt=""/>
      </section>
      <section id="cta">
        <img src="~/assets/cta.png" alt=""/>
        <div class="section-text">
          <div class="flex flex-col items-center justify-center space-y-10 ">
            <span class="section-title">
              Join the fight
            </span>
            <p>
              Step into the arena and unleash your creation! Simply create an account, drag & drop your bot binary, and dive into the action. Watch your bot battle others, climb the ranks, and dominate the leagues. Join now and let the competition begin!
            </p>
          </div>
          <div class="section-button">
            <span>Upload your first bot</span>
            <i class="fa-light fa-transporter"></i>
          </div>
        </div>
      </section>
      <section id="groups">
        <div class="section-text">
          <div class="flex flex-col items-center justify-center space-y-10 ">
            <span class="section-title">
              Create groups
            </span>
            <p>
              Collaborate and conquer by creating or joining groups! Share the management and uploading of bots with teammates, strategize together, and dominate the competition as a united force. Team up, share the glory, and rise through the ranks together!
            </p>
          </div>
        </div>
        <img src="~/assets/groups.png" alt="" class="bordered"/>
      </section>
      <section id="leagues">
      </section>
    </main>
    <footer>
      <div id="footer-left">
        <div id="footer-logo">
          <img src="~/assets/logo.png" alt=""/>
          <span id="footer-logo-text">
            Zappy-Arena
          </span>
        </div>
        <span>
          Compete against other, unleash them all !
        </span>
      </div>
      <div id="footer-right">
        <span> Made with </span>
        <i class="fa-duotone fa-heart"></i>
        <span> by </span>
        <span class="footer-link" @click="openAuthor">Axel ECKENBERG</span>
        <span> @ </span>
        <span class="footer-link" @click="openEpitech">Epitech Nantes</span>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="postcss">
#body {
  @apply flex flex-col;
  @apply w-full h-full;
  @apply bg-black;

  header {
    @apply flex flex-row justify-between items-center;
    @apply w-full;
    @apply p-4;
    @apply bg-black;

    #header-logo {
      @apply flex flex-row items-center;
      @apply select-none;

      img {
        width: 59px;
        height: 47px;
      }

      #header-logo-text {
        @apply text-2xl text-white;
        @apply ml-2;
        @apply font-bold;
        font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
      }
    }

    #right {
      @apply flex flex-row items-center;
      @apply space-x-8;

      #menu {
        @apply flex flex-row items-center;
        @apply space-x-4;

        .menu-item {
          @apply flex flex-row items-center;
          @apply cursor-pointer;

          span {
            @apply text-base text-white;
            font-family: 'ZillaSlab-Medium', Montserrat, Roboto, sans-serif;
          }

          i {
            @apply ml-1 text-white;
            @apply text-xs;
          }
        }
      }

      #auth {
        @apply flex flex-row items-center;
        @apply space-x-4;

        .auth-item {
          @apply flex flex-row items-center justify-center;
          @apply cursor-pointer;
          @apply text-white;
          font-family: 'ZillaSlab-BoldItalic', Montserrat, Roboto, sans-serif;
          @apply text-lg;

          &#signup {
            @apply border border-white;
            @apply rounded-lg;
            @apply px-4;
          }

          &#dashboard {
            @apply flex flex-row items-center justify-end;
            @apply space-x-2;
            @apply border border-white;
            @apply rounded-full;
            @apply py-1 pr-2 pl-4;

            #avatar {
              @apply w-8 h-8;
            }
          }
        }
      }
    }
  }

  main {
    @apply flex flex-col;
    @apply w-full;
    @apply h-full;

    #hero {
      @apply flex flex-col items-center justify-center;
      @apply relative;
      @apply w-full;
      @apply h-screen;

      span {
        @apply text-white;
        font-size: calc(0.1 * 60vw);
        @apply font-bold;
        @apply w-1/2;
        @apply absolute;
        @apply top-1/2 left-4;
        @apply transform -translate-y-full;
        font-family: 'PlayfairDisplay-Italic', Montserrat, Roboto, sans-serif;
      }

      img {
        width: 100%;
        height: 100%;
        max-width: unset;
        max-height: unset;
        object-fit: cover;
      }
    }

    section {
      @apply flex flex-row items-center justify-around;
      @apply w-full;
      @apply h-screen;

      img {
        max-height: 75%;
        height: fit-content;
        max-width: 40%;
        object-fit: scale-down;

        &.bordered {
          @apply border-2 border-white;
        }
      }

      .section-text {
        @apply flex flex-col items-center justify-center;
        @apply space-y-32;
        @apply w-1/2 h-full;
        @apply text-white;
        font-family: 'ZillaSlab-Regular', Montserrat, Roboto, sans-serif;

        .section-title {
          @apply text-6xl;
          @apply font-bold;
          font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
        }

        p {
          @apply text-3xl;
          @apply text-gray-200;
          @apply text-justify;
        }

        .section-button {
          @apply flex flex-row items-center justify-center;
          @apply space-x-6;
          @apply cursor-pointer;
          @apply text-white;
          font-family: 'ZillaSlab-Regular', Montserrat, Roboto, sans-serif;
          @apply text-3xl;
          @apply border border-white;
          @apply rounded-lg;
          @apply px-4 py-2;

          i {
            @apply ml-2;
          }
        }
      }
    }
  }

  footer {
    @apply flex flex-row justify-between items-center;
    @apply w-full;
    @apply px-16 py-8;
    @apply bg-black;
    @apply text-white;
    font-family: 'ZillaSlab-Regular', Montserrat, Roboto, sans-serif;

    #footer-left {
      @apply flex flex-col items-start justify-center;
      @apply w-1/3;

      #footer-logo {
        @apply flex flex-row items-center;

        img {
          width: 59px;
          height: 47px;
        }

        #footer-logo-text {
          @apply text-2xl;
          @apply font-bold;
          font-family: 'RacingSansOne-Regular', Montserrat, Roboto, sans-serif;
        }
      }

      span {
        @apply text-base;
        font-family: 'ZillaSlab-Regular', Montserrat, Roboto, sans-serif;
      }
    }

    #footer-right {
      @apply w-full;
      @apply flex flex-row items-center justify-center;
      @apply space-x-2;
      @apply text-white;
      font-family: 'ZillaSlab-Regular', Montserrat, Roboto, sans-serif;

      .footer-link {
        @apply cursor-pointer;
        @apply transition-all duration-300;

        &:hover {
          @apply underline;
        }
      }
    }
  }
}
</style>