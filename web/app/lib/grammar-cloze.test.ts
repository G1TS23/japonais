import { describe, expect, it } from 'vitest'
import { GRAMMAR_N5 } from '~/data/grammar-n5'
import { buildClozeSeeds } from './grammar-cloze'

describe('GRAMMAR_N5 — champ blank', () => {
  it('est toujours un sous-texte exact de la phrase japonaise associée', () => {
    for (const p of GRAMMAR_N5) {
      for (const e of p.exemples) {
        if (e.blank === undefined) continue
        expect(e.jp.includes(e.blank), `${p.id} : blank ${JSON.stringify(e.blank)} absent de ${JSON.stringify(e.jp)}`).toBe(
          true,
        )
      }
    }
  })

  it('couvre une bonne partie de la banque', () => {
    const withBlank = GRAMMAR_N5.filter((p) => p.exemples.some((e) => e.blank !== undefined))
    expect(withBlank.length).toBeGreaterThan(50)
  })
})

describe('buildClozeSeeds', () => {
  const seeds = buildClozeSeeds()

  it("ne génère rien pour les exemples sans blank, une carte par exemple marqué", () => {
    const marked = GRAMMAR_N5.reduce((n, p) => n + p.exemples.filter((e) => e.blank !== undefined).length, 0)
    expect(seeds).toHaveLength(marked)
  })

  it('a des content_id uniques, préfixés par le point de grammaire', () => {
    const ids = seeds.map((s) => s.contentId)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of seeds) expect(s.contentId).toBe(`grammar:${s.grammarId}:${s.contentId.split(':')[2]}`)
  })

  it('remplace le segment blank par ＿＿ et laisse le reste intact', () => {
    const wa = seeds.find((s) => s.grammarId === 'n5-wa')!
    expect(wa.cloze).toBe('わたし＿＿ がくせいです。')
    expect(wa.answer).toBe('は')
    expect(wa.fullJp).toBe('わたしは がくせいです。')
    expect(wa.fullFr).toBe('Moi, je suis étudiant.')
  })

  it('reprend la glose du point comme `sens`', () => {
    const wa = seeds.find((s) => s.grammarId === 'n5-wa')!
    const point = GRAMMAR_N5.find((p) => p.id === 'n5-wa')!
    expect(wa.sens).toBe(point.sens)
  })
})
