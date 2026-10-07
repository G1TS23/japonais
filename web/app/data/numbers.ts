/**
 * Nombres cardinaux et compteurs japonais.
 *
 * `numberReading` lit algorithmiquement 0–9999 : les irrégularités de
 * gémination/voisement sur 百/千 sont des tables d'exceptions distinctes
 * (piège : les deux ne se recoupent pas, ex. 6 géminé sur 百 mais pas sur
 * 千) — volontairement pas de règle unique généralisée. `COUNTERS` liste des
 * lectures hand-authored (vérifiées manuellement), irrégulières 1–10 puis
 * régulières au-delà (limitation documentée, pas une erreur de contenu).
 */

export interface NumberReading {
  kanji: string
  kana: string
}

const DIGITS_KANJI = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const DIGITS_KANA = ['ゼロ', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう']

/**
 * Exceptions de lecture pour les chiffres des centaines (préfixe de 百) :
 * préfixe ET suffixe (百 se voise/géminie différemment selon le chiffre).
 */
const HUNDREDS_PREFIX: Record<number, { kanji: string; kana: string; suffix: string }> = {
  1: { kanji: '', kana: '', suffix: 'ひゃく' },
  3: { kanji: '三', kana: 'さん', suffix: 'びゃく' },
  6: { kanji: '六', kana: 'ろっ', suffix: 'ぴゃく' },
  8: { kanji: '八', kana: 'はっ', suffix: 'ぴゃく' },
}

/** Exceptions de lecture pour les chiffres des milliers (préfixe de 千). Table distincte de celle des centaines. */
const THOUSANDS_PREFIX: Record<number, { kanji: string; kana: string; suffix: string }> = {
  1: { kanji: '', kana: '', suffix: 'せん' },
  3: { kanji: '三', kana: 'さん', suffix: 'ぜん' },
  8: { kanji: '八', kana: 'はっ', suffix: 'せん' },
}

/** Lit 1–99. */
function readTens(n: number): NumberReading {
  if (n < 10) return { kanji: DIGITS_KANJI[n]!, kana: DIGITS_KANA[n]! }
  const tens = Math.floor(n / 10)
  const units = n % 10
  const tensKanji = (tens === 1 ? '' : DIGITS_KANJI[tens]) + '十'
  const tensKana = (tens === 1 ? '' : DIGITS_KANA[tens]) + 'じゅう'
  if (units === 0) return { kanji: tensKanji, kana: tensKana }
  return { kanji: tensKanji + DIGITS_KANJI[units]!, kana: tensKana + DIGITS_KANA[units]! }
}

/** Lit 1–999. */
function readHundreds(n: number): NumberReading {
  if (n < 100) return readTens(n)
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  const prefix = HUNDREDS_PREFIX[hundreds] ?? {
    kanji: DIGITS_KANJI[hundreds]!,
    kana: DIGITS_KANA[hundreds]!,
    suffix: 'ひゃく',
  }
  const hundredsKanji = prefix.kanji + '百'
  const hundredsKana = prefix.kana + prefix.suffix
  if (rest === 0) return { kanji: hundredsKanji, kana: hundredsKana }
  const r = readTens(rest)
  return { kanji: hundredsKanji + r.kanji, kana: hundredsKana + r.kana }
}

/** Lit 1–9999. */
function readThousands(n: number): NumberReading {
  if (n < 1000) return readHundreds(n)
  const thousands = Math.floor(n / 1000)
  const rest = n % 1000
  const prefix = THOUSANDS_PREFIX[thousands] ?? {
    kanji: DIGITS_KANJI[thousands]!,
    kana: DIGITS_KANA[thousands]!,
    suffix: 'せん',
  }
  const thousandsKanji = prefix.kanji + '千'
  const thousandsKana = prefix.kana + prefix.suffix
  if (rest === 0) return { kanji: thousandsKanji, kana: thousandsKana }
  const r = readHundreds(rest)
  return { kanji: thousandsKanji + r.kanji, kana: thousandsKana + r.kana }
}

/** Lit un nombre cardinal 0–9999. 万 (10 000) garde un いち explicite, contrairement à 百/千. */
export function numberReading(n: number): NumberReading {
  if (n < 0 || n > 9999 || !Number.isInteger(n)) {
    throw new RangeError(`numberReading: ${n} hors de l'intervalle géré (0–9999)`)
  }
  if (n === 0) return { kanji: '〇', kana: 'ゼロ' }
  return readThousands(n)
}

export type CounterId = 'tsu' | 'nin' | 'ko' | 'mai' | 'hon' | 'kai_fois' | 'kai_etage' | 'sai'

export interface CounterEntry {
  id: CounterId
  kanji: string
  label: string
  /** Lectures 1–10, index 0 = « 1 », … index 9 = « 10 ». */
  readings: string[]
  /** Au-delà de 10 : retombe sur la lecture régulière du compteur, sans regémination/revoisement. */
  capAt10?: boolean
  notes?: string[]
}

export const COUNTERS: CounterEntry[] = [
  {
    id: 'tsu',
    kanji: '〜つ',
    label: 'Objets (générique)',
    readings: ['ひとつ', 'ふたつ', 'みっつ', 'よっつ', 'いつつ', 'むっつ', 'ななつ', 'やっつ', 'ここのつ', 'とお'],
    capAt10: true,
    notes: ['Ne se prolonge pas au-delà de 10 — on passe à une autre série au besoin.'],
  },
  {
    id: 'nin',
    kanji: '〜人',
    label: 'Personnes',
    readings: ['ひとり', 'ふたり', 'さんにん', 'よにん', 'ごにん', 'ろくにん', 'しちにん', 'はちにん', 'きゅうにん', 'じゅうにん'],
    notes: ['1 et 2 sont irréguliers (ひとり, ふたり) ; à partir de 3, lecture régulière.'],
  },
  {
    id: 'ko',
    kanji: '〜個',
    label: 'Objets (petits, ronds…)',
    readings: ['いっこ', 'にこ', 'さんこ', 'よんこ', 'ごこ', 'ろっこ', 'ななこ', 'はちこ', 'きゅうこ', 'じゅっこ'],
  },
  {
    id: 'mai',
    kanji: '〜枚',
    label: 'Objets plats (feuilles, timbres, billets)',
    readings: ['いちまい', 'にまい', 'さんまい', 'よんまい', 'ごまい', 'ろくまい', 'ななまい', 'はちまい', 'きゅうまい', 'じゅうまい'],
    notes: ['Lecture entièrement régulière.'],
  },
  {
    id: 'hon',
    kanji: '〜本',
    label: 'Objets longs et fins (bouteilles, stylos…)',
    readings: ['いっぽん', 'にほん', 'さんぼん', 'よんほん', 'ごほん', 'ろっぽん', 'ななほん', 'はっぽん', 'きゅうほん', 'じゅっぽん'],
  },
  {
    id: 'kai_fois',
    kanji: '〜回',
    label: 'Fois (fréquence)',
    readings: ['いっかい', 'にかい', 'さんかい', 'よんかい', 'ごかい', 'ろっかい', 'ななかい', 'はっかい', 'きゅうかい', 'じゅっかい'],
  },
  {
    id: 'kai_etage',
    kanji: '〜階',
    label: 'Étages',
    readings: ['いっかい', 'にかい', 'さんかい', 'よんかい', 'ごかい', 'ろっかい', 'ななかい', 'はっかい', 'きゅうかい', 'じゅっかい'],
    notes: ['Mêmes lectures que 〜回 (même son かい), kanji différent.'],
  },
  {
    id: 'sai',
    kanji: '〜歳',
    label: 'Âge',
    readings: ['いっさい', 'にさい', 'さんさい', 'よんさい', 'ごさい', 'ろくさい', 'ななさい', 'はっさい', 'きゅうさい', 'じゅっさい'],
    notes: ['二十歳 (20 ans) se lit はたち, pas にじゅっさい.'],
  },
]
