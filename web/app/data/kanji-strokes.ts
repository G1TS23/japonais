import entriesRaw from './kanji-strokes.json'

export interface KanjiStrokes {
  kanji: string
  /** Chemins SVG (`d`), un par trait, dans l'ordre d'écriture. */
  strokes: string[]
}

export const KANJI_STROKES: KanjiStrokes[] = entriesRaw as KanjiStrokes[]
