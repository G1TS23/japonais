import { KANJI_STROKES, type KanjiStrokes } from '~/data/kanji-strokes'

export { KANJI_STROKES }
export type { KanjiStrokes }

/** Côté (en unités du viewBox KanjiVG, 0 0 109 109) du canevas source des tracés. */
export const KANJI_VIEWBOX = 109

export function findKanjiStrokes(kanji: string, bank: KanjiStrokes[] = KANJI_STROKES): KanjiStrokes | undefined {
  return bank.find((k) => k.kanji === kanji)
}

/** Du plus simple au plus complexe (nombre de traits) : progression naturelle pour s'entraîner. */
export function sortedByComplexity(bank: KanjiStrokes[] = KANJI_STROKES): KanjiStrokes[] {
  return [...bank].sort((a, b) => a.strokes.length - b.strokes.length)
}
