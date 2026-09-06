import type { RouterConfig } from '@nuxt/schema'

/**
 * Remonter en haut de page à chaque navigation.
 *
 * - Retour / avance navigateur : on restaure la position mémorisée.
 * - Lien avec ancre (#…) : on va à l'ancre.
 * - Même page (changement de query seulement) : on ne touche à rien.
 * - Sinon : on attend le rendu de la nouvelle page (`page:finish`, l'appli
 *   est 100 % cliente) puis on remonte tout en haut.
 */
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 0 }
    if (to.path === from.path) return false

    return new Promise((resolve) => {
      const top = { left: 0, top: 0 }
      const nuxtApp = useNuxtApp()
      nuxtApp.hooks.hookOnce('page:finish', () => resolve(top))
      // Filet de sécurité si le hook a déjà été émis.
      setTimeout(() => resolve(top), 300)
    })
  },
}
