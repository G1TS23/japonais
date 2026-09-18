import { describe, expect, it } from 'vitest'
import { KANJI_STROKES } from './kanji-strokes'

describe('KANJI_STROKES (données générées)', () => {
  it('a des kanji uniques, chacun avec au moins un tracé', () => {
    const seen = new Set<string>()
    for (const k of KANJI_STROKES) {
      expect(seen.has(k.kanji), `doublon : ${k.kanji}`).toBe(false)
      seen.add(k.kanji)
      expect(k.kanji.length, k.kanji).toBe(1)
      expect(k.strokes.length, k.kanji).toBeGreaterThan(0)
      for (const d of k.strokes) expect(d.length, k.kanji).toBeGreaterThan(0)
    }
  })

  it('couvre les 103 kanji du palier N5 (kanjidic2 jlptLevel=4)', () => {
    expect(KANJI_STROKES).toHaveLength(103)
  })

  it('contient des kanji N5 courants', () => {
    const kanjiSet = new Set(KANJI_STROKES.map((k) => k.kanji))
    expect(kanjiSet.has('日')).toBe(true)
    expect(kanjiSet.has('水')).toBe(true)
    expect(kanjiSet.has('学')).toBe(true)
  })
})
