import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  GRAMMAR_N5,
  type GrammarCategory,
  type GrammarPoint,
} from '~/data/grammar-n5'

export type { GrammarCategory, GrammarPoint }
export { CATEGORY_LABELS, CATEGORY_ORDER, GRAMMAR_N5 }

export function findGrammarPoint(id: string, bank: GrammarPoint[] = GRAMMAR_N5): GrammarPoint | undefined {
  return bank.find((p) => p.id === id)
}

export interface GrammarGroup {
  categorie: GrammarCategory
  label: string
  points: GrammarPoint[]
}

/** Points regroupés par catégorie, dans l'ordre pédagogique ; catégories vides omises. */
export function groupByCategory(bank: GrammarPoint[] = GRAMMAR_N5): GrammarGroup[] {
  return CATEGORY_ORDER.map((categorie) => ({
    categorie,
    label: CATEGORY_LABELS[categorie],
    points: bank.filter((p) => p.categorie === categorie),
  })).filter((g) => g.points.length > 0)
}

/** Minuscules sans diacritiques, pour une recherche tolérante côté français. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

/**
 * Recherche libre : titre, structure, sens, explication, notes et exemples.
 * Insensible à la casse et aux accents ; le japonais fonctionne tel quel.
 */
export function searchGrammar(query: string, bank: GrammarPoint[] = GRAMMAR_N5): GrammarPoint[] {
  const q = normalize(query.trim())
  if (!q) return bank
  return bank.filter((p) => {
    const haystack = [
      p.titre,
      p.structure,
      p.sens,
      p.explication,
      ...(p.notes ?? []),
      ...p.exemples.flatMap((e) => [e.jp, e.lecture ?? '', e.fr]),
    ].join(' ')
    return normalize(haystack).includes(q)
  })
}

/** Points listés dans `voirAussi`, résolus et filtrés des ids inconnus. */
export function relatedPoints(point: GrammarPoint, bank: GrammarPoint[] = GRAMMAR_N5): GrammarPoint[] {
  return (point.voirAussi ?? [])
    .map((id) => findGrammarPoint(id, bank))
    .filter((p): p is GrammarPoint => p !== undefined)
}
