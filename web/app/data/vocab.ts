import n5Raw from './vocab-n5.json'

/**
 * Entrée de vocabulaire statique (contenu fourni), distincte de la carte SRS
 * vivante dans IndexedDB (`lib/db.ts#Card`). `content_id` sert de clé stable
 * pour éviter les doublons lors de l'import dans le deck de l'utilisateur.
 */
export interface VocabEntry {
  content_id: string
  terme: string
  lecture: string
  sens_en: string
  sens_fr: string | null
  sens_fr_source: 'jmdict' | 'manuel' | null
  tags: string[]
}

export const VOCAB_N5: VocabEntry[] = n5Raw as VocabEntry[]
