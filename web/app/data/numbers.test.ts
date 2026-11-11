import { describe, expect, it } from 'vitest'
import { COUNTERS, numberReading } from './numbers'

describe('numberReading', () => {
  it('lit 0 et les unités de base', () => {
    expect(numberReading(0)).toEqual({ kanji: '〇', kana: 'ゼロ' })
    expect(numberReading(1)).toEqual({ kanji: '一', kana: 'いち' })
    expect(numberReading(4)).toEqual({ kanji: '四', kana: 'よん' })
    expect(numberReading(9)).toEqual({ kanji: '九', kana: 'きゅう' })
  })

  it('lit les dizaines, dont 10 et les composés', () => {
    expect(numberReading(10)).toEqual({ kanji: '十', kana: 'じゅう' })
    expect(numberReading(20)).toEqual({ kanji: '二十', kana: 'にじゅう' })
    expect(numberReading(47)).toEqual({ kanji: '四十七', kana: 'よんじゅうなな' })
  })

  it('cas pièges des centaines : 100/300/600/800 (gémination/voisement irréguliers)', () => {
    expect(numberReading(100)).toEqual({ kanji: '百', kana: 'ひゃく' }) // pas いっぴゃく
    expect(numberReading(300)).toEqual({ kanji: '三百', kana: 'さんびゃく' }) // voisée
    expect(numberReading(600)).toEqual({ kanji: '六百', kana: 'ろっぴゃく' }) // géminée
    expect(numberReading(800)).toEqual({ kanji: '八百', kana: 'はっぴゃく' }) // géminée
  })

  it('les autres centaines sont régulières', () => {
    expect(numberReading(200)).toEqual({ kanji: '二百', kana: 'にひゃく' })
    expect(numberReading(700)).toEqual({ kanji: '七百', kana: 'ななひゃく' })
  })

  it('cas pièges des milliers : 1000/3000/8000, et 6000 qui NE géminie PAS (contrairement à 600)', () => {
    expect(numberReading(1000)).toEqual({ kanji: '千', kana: 'せん' }) // pas いっせん
    expect(numberReading(3000)).toEqual({ kanji: '三千', kana: 'さんぜん' }) // voisée
    expect(numberReading(8000)).toEqual({ kanji: '八千', kana: 'はっせん' }) // géminée
    expect(numberReading(6000)).toEqual({ kanji: '六千', kana: 'ろくせん' }) // régulier ici
  })

  it('万 garde un いち explicite, contrairement à 百/千', () => {
    expect(numberReading(9999)).toEqual({ kanji: '九千九百九十九', kana: 'きゅうせんきゅうひゃくきゅうじゅうきゅう' })
  })

  it('nombres composés', () => {
    expect(numberReading(256)).toEqual({ kanji: '二百五十六', kana: 'にひゃくごじゅうろく' })
    expect(numberReading(3800)).toEqual({ kanji: '三千八百', kana: 'さんぜんはっぴゃく' })
  })

  it('rejette les entrées hors intervalle', () => {
    expect(() => numberReading(-1)).toThrow(RangeError)
    expect(() => numberReading(10000)).toThrow(RangeError)
    expect(() => numberReading(1.5)).toThrow(RangeError)
  })
})

describe('COUNTERS', () => {
  it('a 8 compteurs, chacun avec 10 lectures non vides', () => {
    expect(COUNTERS).toHaveLength(8)
    for (const c of COUNTERS) {
      expect(c.readings, c.id).toHaveLength(10)
      for (const r of c.readings) expect(r.length, c.id).toBeGreaterThan(0)
    }
  })

  it('a des ids uniques', () => {
    const ids = COUNTERS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('kai_fois et kai_etage partagent les mêmes lectures mais pas le même kanji', () => {
    const kaiFois = COUNTERS.find((c) => c.id === 'kai_fois')!
    const kaiEtage = COUNTERS.find((c) => c.id === 'kai_etage')!
    expect(kaiFois.readings).toEqual(kaiEtage.readings)
    expect(kaiFois.kanji).not.toBe(kaiEtage.kanji)
  })
})
