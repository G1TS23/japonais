import { ref } from 'vue'
import type { DictionaryEntry } from '~/lib/dictionary'

/**
 * État partagé du popover de définition (voir DictionaryPopover.vue, monté
 * une fois dans le layout). `~/lib/dictionary` embarque les ~15 000 entrées
 * JMdict-fre (~1,6 Mo) : import() dynamique pour que ce poids ne rejoigne le
 * chunk d'AUCUNE page tant que l'utilisateur n'a pas tapé un mot.
 */
const open = ref(false)
const loading = ref(false)
const term = ref('')
const entries = ref<DictionaryEntry[]>([])

async function openDefinition(text: string) {
  const q = text.trim()
  if (!q) return
  term.value = q
  entries.value = []
  loading.value = true
  open.value = true
  const { lookupExact } = await import('~/lib/dictionary')
  // L'ouverture a pu être suivie d'un tap sur un autre mot avant la fin du
  // chargement : on n'écrase le résultat que s'il concerne toujours ce mot.
  if (term.value === q) {
    entries.value = lookupExact(q)
    loading.value = false
  }
}

function closeDefinition() {
  open.value = false
}

export function useDictionaryPopover() {
  return { open, loading, term, entries, openDefinition, closeDefinition }
}
