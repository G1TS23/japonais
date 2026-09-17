import { DICTIONARY, type DictionaryEntry } from '~/data/dictionary'

export type { DictionaryEntry }
export { DICTIONARY }

/** Minuscules sans diacritiques, pour une recherche française tolérante. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

const HAS_JAPANESE = /[぀-ヿ㐀-䶿一-龯]/

/** Les mots courants d'abord, sans changer l'ordre relatif au sein d'un groupe (tri stable). */
function byCommonFirst(entries: DictionaryEntry[]): DictionaryEntry[] {
  return [...entries].sort((a, b) => Number(!!b.common) - Number(!!a.common))
}

/**
 * Recherche tolérante dans le dictionnaire.
 *
 * - Requête contenant du japonais : correspondance exacte (kanji ou lecture),
 *   puis préfixe, puis sous-texte — chaque groupe classé mots courants
 *   d'abord.
 * - Sinon (français) : sous-texte dans les gloses, accents/casse ignorés.
 */
export function searchDictionary(query: string, bank: DictionaryEntry[] = DICTIONARY, limit = 30): DictionaryEntry[] {
  const q = query.trim()
  if (!q) return []

  if (HAS_JAPANESE.test(q)) {
    const exact: DictionaryEntry[] = []
    const prefix: DictionaryEntry[] = []
    const contains: DictionaryEntry[] = []
    for (const e of bank) {
      if (e.kanji === q || e.reading === q) exact.push(e)
      else if (e.kanji?.startsWith(q) || e.reading.startsWith(q)) prefix.push(e)
      else if (e.kanji?.includes(q) || e.reading.includes(q)) contains.push(e)
    }
    return [...byCommonFirst(exact), ...byCommonFirst(prefix), ...byCommonFirst(contains)].slice(0, limit)
  }

  const nq = normalize(q)
  const matches = bank.filter((e) => normalize(e.gloss).includes(nq))
  return byCommonFirst(matches).slice(0, limit)
}

/** Une entrée par kanji ou lecture exacte (ex. pour un lookup au tap sur un mot connu). */
export function lookupExact(term: string, bank: DictionaryEntry[] = DICTIONARY): DictionaryEntry[] {
  return bank.filter((e) => e.kanji === term || e.reading === term)
}
