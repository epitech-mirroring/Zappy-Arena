// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ['jose']
  },
  app: {
    head: {
      script: [
        { src: 'https://kit.fontawesome.com/11429f75b4.js', crossorigin: 'anonymous' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      posthogPublicKey: 'phc_E1SiWhIRxWsm2f6ko8ZhXFbiyZ72XZkLZjbchEVELYw',
      posthogHost: "https://us.i.posthog.com",
      apiHost: process.env.NODE_ENV === 'production' ? 'https://api.arena.n-king.com' : 'http://localhost:3001'
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ['@pinia/nuxt'],
})
