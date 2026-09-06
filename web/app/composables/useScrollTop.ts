import { nextTick, watch, type WatchSource } from 'vue'

/**
 * Remonte la fenêtre tout en haut à chaque changement de `source`.
 *
 * Les exercices (kana, SRS, quiz) changent d'étape via un simple ref réactif,
 * sans navigation : `scrollBehavior` du routeur ne s'applique pas, d'où ce
 * complément.
 */
export function useScrollTopOn(source: WatchSource): void {
  watch(source, async () => {
    await nextTick()
    if (import.meta.client) window.scrollTo({ top: 0 })
  })
}
