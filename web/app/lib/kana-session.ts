import { KANA, type KanaEntry, type KanaGroup, type KanaScript } from '~/data/kana'

export type Script = 'hiragana' | 'katakana' | 'mixte'
export type Direction = 'kana2romaji' | 'romaji2kana'

export interface DrillItem {
  /** Identifiant unique = le caractère lui-même (hira ≠ kata en Unicode). */
  id: string
  char: string
  type: KanaScript
  romaji: string
  alt: string[]
  entry: KanaEntry
}

export interface KanaAccuracy {
  seen: number
  correct: number
  accuracy: number
}

export interface DrillResult {
  total: number
  firstTryCorrect: number
  missed: string[]
  durationMs: number
}

function expand(entry: KanaEntry, script: Script): DrillItem[] {
  const out: DrillItem[] = []
  const add = (type: KanaScript) => {
    const char = type === 'hiragana' ? entry.hira : entry.kata
    out.push({ id: char, char, type, romaji: entry.romaji, alt: entry.alt ?? [], entry })
  }
  if (script === 'hiragana' || script === 'mixte') add('hiragana')
  if (script === 'katakana' || script === 'mixte') add('katakana')
  return out
}

/** Ensemble complet des items pour un script + des groupes donnés. */
export function pool(script: Script, groups: KanaGroup[]): DrillItem[] {
  const g = new Set(groups)
  return KANA.filter((e) => g.has(e.group)).flatMap((e) => expand(e, script))
}

function shuffle<T>(arr: T[]): T[] {
  const r = arr.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j]!, r[i]!]
  }
  return r
}

export function buildQueue(opts: {
  script: Script
  groups: KanaGroup[]
  length: number | 'all'
  weakOnly: boolean
  accuracyById: Map<string, KanaAccuracy>
}): DrillItem[] {
  let items = pool(opts.script, opts.groups)
  if (opts.weakOnly) {
    const weak = items.filter((it) => {
      const a = opts.accuracyById.get(it.id)
      return a && a.seen > 0 && a.accuracy < 0.8
    })
    if (weak.length) items = weak
  }
  items = shuffle(items)
  if (opts.length !== 'all') items = items.slice(0, opts.length)
  return items
}

/** Propositions pour le mode QCM : privilégie la même ligne (distracteurs proches). */
export function makeChoices(item: DrillItem, all: DrillItem[], n = 4): string[] {
  const sameType = all.filter((i) => i.type === item.type && i.char !== item.char)
  const near = shuffle(sameType.filter((i) => i.entry.row === item.entry.row))
  const far = shuffle(sameType.filter((i) => i.entry.row !== item.entry.row))
  const picks = [...near, ...far].slice(0, n - 1).map((i) => i.char)
  return shuffle([item.char, ...picks])
}

export function romajiOf(char: string): string {
  return KANA.find((e) => e.hira === char || e.kata === char)?.romaji ?? ''
}
