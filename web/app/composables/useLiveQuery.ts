import { liveQuery } from 'dexie'
import { onScopeDispose, ref, type Ref } from 'vue'

/**
 * Enveloppe `Dexie.liveQuery` dans un ref réactif.
 * Le querier est ré-exécuté à chaque modification des tables qu'il touche.
 */
export function useLiveQuery<T>(querier: () => T | Promise<T>, initial: T): Ref<T> {
  const state = ref(initial) as Ref<T>
  if (import.meta.client) {
    const sub = liveQuery(querier).subscribe({
      next: (v) => (state.value = v),
      error: (e) => console.error('[liveQuery]', e),
    })
    onScopeDispose(() => sub.unsubscribe())
  }
  return state
}
