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

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Une glose (« terme ») découpée en ses variantes séparées par virgule/point-virgule. */
function glossPhrases(gloss: string): string[] {
  return gloss
    .split(/[,;]/)
    .map((p) => normalize(p.trim()))
    .filter(Boolean)
}

/**
 * Pertinence d'une glose française pour une requête : 0 = correspondance
 * exacte d'une des variantes, 3 = simple sous-chaîne dans un mot plus long
 * (ex. « manger » dans « démanger »). `null` = pas de correspondance.
 */
function frenchTier(gloss: string, nq: string): number | null {
  const normGloss = normalize(gloss)
  if (!normGloss.includes(nq)) return null

  const phrases = glossPhrases(gloss)
  if (phrases.includes(nq)) return 0
  if (phrases.some((p) => p.startsWith(`${nq} `))) return 1

  const wordBoundary = new RegExp(`(^|[^a-z0-9])${escapeRegExp(nq)}($|[^a-z0-9])`)
  if (wordBoundary.test(normGloss)) return 2

  return 3
}

/**
 * Recherche tolérante dans le dictionnaire.
 *
 * - Requête contenant du japonais : correspondance exacte (kanji ou lecture),
 *   puis préfixe, puis sous-texte — chaque groupe classé mots courants
 *   d'abord.
 * - Sinon (français) : par pertinence de la glose (correspondance exacte,
 *   puis en début de variante, puis mot entier, puis simple sous-chaîne),
 *   mots courants d'abord à égalité de pertinence. Accents/casse ignorés.
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
  const scored: { entry: DictionaryEntry; tier: number }[] = []
  for (const entry of bank) {
    const tier = frenchTier(entry.gloss, nq)
    if (tier !== null) scored.push({ entry, tier })
  }
  scored.sort((a, b) => a.tier - b.tier || Number(!!b.entry.common) - Number(!!a.entry.common))
  return scored.slice(0, limit).map((s) => s.entry)
}

/** Une entrée par kanji ou lecture exacte (ex. pour un lookup au tap sur un mot connu). */
export function lookupExact(term: string, bank: DictionaryEntry[] = DICTIONARY): DictionaryEntry[] {
  return bank.filter((e) => e.kanji === term || e.reading === term)
}
