import tailwindcss from '@tailwindcss/vite'

const SITE_URL = 'https://japonais.falahi.org'
const SITE_TITLE = "Japonais — compagnon d'apprentissage"
const SITE_DESCRIPTION = "Compagnon d'apprentissage du japonais : drill kana, SRS, programme, quiz."

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Application 100 % cliente : pas de rendu serveur, build statique (`nuxt generate`).
  ssr: false,

  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@vite-pwa/nuxt'],

  css: ['~/assets/css/main.css'],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: SITE_TITLE,
      short_name: '日本語',
      description: SITE_DESCRIPTION,
      lang: 'fr',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: '#bc002d',
      background_color: '#ffffff',
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // Appli 100 % cliente : on précache tout le build et on renvoie le
      // shell pour toute route inconnue → navigation hors-ligne complète.
      globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      // Image sociale (~300 Ko) : utile aux crawlers, inutile hors-ligne.
      globIgnores: ['**/og-image.png'],
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
    },
    client: { installPrompt: true },
    devOptions: { enabled: false },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: SITE_TITLE,
      htmlAttrs: { lang: 'fr' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: SITE_DESCRIPTION },
        { name: 'theme-color', content: '#bc002d' },

        // Installable en plein écran sur iOS / Android
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: '日本語' },
        { name: 'application-name', content: '日本語' },

        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: SITE_URL },
        { property: 'og:site_name', content: '日本語' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:title', content: SITE_TITLE },
        { property: 'og:description', content: SITE_DESCRIPTION },
        { property: 'og:image', content: `${SITE_URL}/og-image.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:alt', content: SITE_TITLE },

        // Twitter Card (X reprend aussi ces balises)
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: SITE_TITLE },
        { name: 'twitter:description', content: SITE_DESCRIPTION },
        { name: 'twitter:image', content: `${SITE_URL}/og-image.png` },
      ],
      link: [
        { rel: 'canonical', href: SITE_URL },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icon-16.png' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
      script: [
        {
          // Anti-flash : pose data-theme sur <html> avant le premier rendu,
          // d'après la préférence miroir en localStorage (le store Pinia lit
          // IndexedDB de façon asynchrone, trop tard pour éviter le flash).
          innerHTML:
            "(function(){try{var t=localStorage.getItem('japonais:theme')||'system';var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()",
          tagPosition: 'head',
          tagPriority: 'critical',
        },
      ],
    },
  },
})
