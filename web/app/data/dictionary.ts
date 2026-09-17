import entriesRaw from './dictionary.json'

/**
 * Entrée du dictionnaire intégré, générée depuis JMdict-fre par
 * `scripts/build-dictionary.mjs` (voir `scripts/README.md`). ~15 300 mots :
 * jmdict-fre ne contient que les entrées ayant une glose française, déjà le
 * sous-ensemble pertinent pour un apprenant francophone.
 */
export interface DictionaryEntry {
  id: string
  /** Forme kanji, absente pour les mots qui ne s'écrivent qu'en kana. */
  kanji?: string
  reading: string
  /** Mot d'usage courant selon JMdict (vs rare/archaïque/spécialisé). */
  common?: boolean
  /** Un ou plusieurs sens, séparés par « ; » s'il y en a plusieurs. */
  gloss: string
}

export const DICTIONARY: DictionaryEntry[] = entriesRaw as DictionaryEntry[]
