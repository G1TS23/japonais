import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Application 100 % cliente : pas de rendu serveur, build statique (`nuxt generate`).
  ssr: false,

  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: "Japonais — compagnon d'apprentissage",
      htmlAttrs: { lang: 'fr' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: "Compagnon d'apprentissage du japonais : drill kana, SRS, programme, quiz." },
      ],
    },
  },
})
