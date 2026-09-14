import { describe, expect, it } from 'vitest'
import { CATEGORY_LABELS, CATEGORY_ORDER, GRAMMAR_N5 } from '~/data/grammar-n5'
import { findGrammarPoint, groupByCategory, relatedPoints, searchGrammar } from './grammar'

describe('banque GRAMMAR_N5', () => {
  it('a des ids uniques, tous préfixés n5-', () => {
    const ids = GRAMMAR_N5.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id.startsWith('n5-'), id).toBe(true)
  })

  it('remplit les champs obligatoires de chaque point', () => {
    for (const p of GRAMMAR_N5) {
      expect(p.titre.length, p.id).toBeGreaterThan(0)
      expect(p.structure.length, p.id).toBeGreaterThan(0)
      expect(p.sens.length, p.id).toBeGreaterThan(0)
      expect(p.explication.length, p.id).toBeGreaterThan(20)
      expect(p.exemples.length, p.id).toBeGreaterThan(0)
    }
  })

  it('donne pour chaque exemple un japonais et une traduction', () => {
    for (const p of GRAMMAR_N5) {
      for (const e of p.exemples) {
        expect(e.jp.trim().length, `${p.id} / jp`).toBeGreaterThan(0)
        expect(e.fr.trim().length, `${p.id} / fr`).toBeGreaterThan(0)
        // Un exemple japonais ne doit pas être écrit en rōmaji.
        expect(/[぀-ヿ㐀-䶿一-龯]/.test(e.jp), `${p.id} : « ${e.jp} » n'a pas de japonais`).toBe(true)
      }
    }
  })

  it('n’a que des catégories connues', () => {
    for (const p of GRAMMAR_N5) {
      expect(CATEGORY_ORDER, p.id).toContain(p.categorie)
      expect(CATEGORY_LABELS[p.categorie], p.id).toBeTruthy()
    }
  })

  it('a des renvois « voir aussi » qui pointent vers des points existants', () => {
    const ids = new Set(GRAMMAR_N5.map((p) => p.id))
    for (const p of GRAMMAR_N5) {
      for (const ref of p.voirAussi ?? []) {
        expect(ids.has(ref), `${p.id} renvoie vers ${ref}, introuvable`).toBe(true)
      }
      expect(p.voirAussi ?? [], p.id).not.toContain(p.id)
    }
  })
})

describe('groupByCategory', () => {
  it('couvre tous les points, sans catégorie vide, dans l’ordre pédagogique', () => {
    const groups = groupByCategory()
    expect(groups.reduce((n, g) => n + g.points.length, 0)).toBe(GRAMMAR_N5.length)
    expect(groups.every((g) => g.points.length > 0)).toBe(true)
    const order = groups.map((g) => g.categorie)
    expect(order).toEqual(CATEGORY_ORDER.filter((c) => order.includes(c)))
  })
})

describe('findGrammarPoint', () => {
  it('retrouve un point par id, sinon undefined', () => {
    expect(findGrammarPoint('n5-wa')?.categorie).toBe('particules')
    expect(findGrammarPoint('n5-inexistant')).toBeUndefined()
  })
})

describe('searchGrammar', () => {
  it('renvoie tout sur une requête vide', () => {
    expect(searchGrammar('   ')).toHaveLength(GRAMMAR_N5.length)
  })

  it('cherche en français, sans tenir compte de la casse ni des accents', () => {
    const ids = searchGrammar('theme').map((p) => p.id)
    expect(ids).toContain('n5-wa')
    expect(searchGrammar('THÈME').map((p) => p.id)).toContain('n5-wa')
  })

  it('cherche aussi en japonais', () => {
    expect(searchGrammar('ましょう').map((p) => p.id)).toContain('n5-mashou')
  })

  it('renvoie une liste vide si rien ne correspond', () => {
    expect(searchGrammar('zzzzzz')).toEqual([])
  })
})

describe('relatedPoints', () => {
  it('résout les renvois et ignore les ids inconnus', () => {
    const point = { ...findGrammarPoint('n5-wa')!, voirAussi: ['n5-mo', 'n5-inexistant'] }
    expect(relatedPoints(point).map((p) => p.id)).toEqual(['n5-mo'])
  })
})
