import { KANJI_STROKES, type KanjiStrokes } from '~/data/kanji-strokes'

export { KANJI_STROKES }
export type { KanjiStrokes }

/** Côté (en unités du viewBox KanjiVG, 0 0 109 109) du canevas source des tracés. */
export const KANJI_VIEWBOX = 109

export function findKanjiStrokes(kanji: string, bank: KanjiStrokes[] = KANJI_STROKES): KanjiStrokes | undefined {
  return bank.find((k) => k.kanji === kanji)
}
