import { GRAMMAR_N5, type GrammarCategory, type GrammarPoint } from '~/data/grammar-n5'

/** Une carte « phrase à trou » construite depuis un exemple marqué `blank`. */
export interface ClozeSeed {
  /** Clé stable pour dédupliquer à l'import (`grammar:<pointId>:<indexExemple>`). */
  contentId: string
  grammarId: string
  categorie: GrammarCategory
  /** Phrase avec le segment `blank` remplacé par ＿＿. */
  cloze: string
  /** Segment attendu. */
  answer: string
  fullJp: string
  fullFr: string
  /** Glose courte du point, pour l'afficher au dos de la carte. */
  sens: string
}

/**
 * Construit une carte à trou pour chaque exemple marqué `blank` de la banque.
 * Un exemple sans `blank` ne génère rien — toute la banque n'a pas besoin
 * d'être annotée dès le départ (voir ROADMAP.md).
 */
export function buildClozeSeeds(bank: GrammarPoint[] = GRAMMAR_N5): ClozeSeed[] {
  const seeds: ClozeSeed[] = []
  for (const point of bank) {
    point.exemples.forEach((ex, i) => {
      if (!ex.blank) return
      const idx = ex.jp.indexOf(ex.blank)
      if (idx === -1) return // garde-fou : `blank` doit être un sous-texte réel de `jp`
      const cloze = ex.jp.slice(0, idx) + '＿＿' + ex.jp.slice(idx + ex.blank.length)
      seeds.push({
        contentId: `grammar:${point.id}:${i}`,
        grammarId: point.id,
        categorie: point.categorie,
        cloze,
        answer: ex.blank,
        fullJp: ex.jp,
        fullFr: ex.fr,
        sens: point.sens,
      })
    })
  }
  return seeds
}
