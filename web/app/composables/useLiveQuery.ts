import { liveQuery } from 'dexie'
import { onScopeDispose, ref, watch, type Ref, type WatchSource } from 'vue'

/**
 * Enveloppe `Dexie.liveQuery` dans un ref réactif.
 * Le querier est ré-exécuté à chaque modification des tables Dexie qu'il
 * touche — `liveQuery` ne connaît que les tables, pas la réactivité Vue. Si
 * le querier dépend aussi d'une valeur réactive externe (ex. un filtre
 * choisi par l'utilisateur, pas une écriture en base), passer cette valeur
 * dans `deps` pour resouscrire quand elle change ; sinon un changement de
 * `deps` sans écriture Dexie entre-temps laisserait le résultat affiché
 * périmé jusqu'à la prochaine mutation d'une table touchée par le querier.
 */
export function useLiveQuery<T>(querier: () => T | Promise<T>, initial: T, deps: WatchSource[] = []): Ref<T> {
  const state = ref(initial) as Ref<T>
  if (import.meta.client) {
    let sub: { unsubscribe: () => void } | null = null
    const resubscribe = () => {
      sub?.unsubscribe()
      sub = liveQuery(querier).subscribe({
        next: (v) => (state.value = v),
        error: (e) => console.error('[liveQuery]', e),
      })
    }
    resubscribe()
    if (deps.length) onScopeDispose(watch(deps, resubscribe))
    onScopeDispose(() => sub?.unsubscribe())
  }
  return state
}
