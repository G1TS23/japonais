import { describe, expect, it } from 'vitest'
import { buildQueue, makeChoices, pool, type KanaAccuracy } from './kana-session'

describe('pool', () => {
  it('compte 46 items pour hiragana/base', () => {
    expect(pool('hiragana', ['base'])).toHaveLength(46)
  })

  it('double le compte en mixte (hiragana + katakana)', () => {
    expect(pool('mixte', ['base'])).toHaveLength(92)
  })

  it('cumule tous les groupes', () => {
    expect(pool('hiragana', ['base', 'dakuten', 'handakuten', 'yoon'])).toHaveLength(104)
  })

  it("renvoie un tableau vide si aucun groupe n'est sélectionné", () => {
    expect(pool('hiragana', [])).toHaveLength(0)
  })
})

describe('buildQueue', () => {
  it('limite la file à la longueur demandée', () => {
    const q = buildQueue({
      script: 'hiragana',
      groups: ['base'],
      length: 10,
      weakOnly: false,
      accuracyById: new Map(),
    })
    expect(q).toHaveLength(10)
  })

  it("'all' renvoie l'ensemble du pool", () => {
    const q = buildQueue({
      script: 'hiragana',
      groups: ['base'],
      length: 'all',
      weakOnly: false,
      accuracyById: new Map(),
    })
    expect(q).toHaveLength(46)
  })

  it('weakOnly revient au pool complet quand aucune statistique ne qualifie de point faible', () => {
    const q = buildQueue({
      script: 'hiragana',
      groups: ['base'],
      length: 'all',
      weakOnly: true,
      accuracyById: new Map(), // aucune entrée vue -> aucun "point faible" au sens strict
    })
    expect(q).toHaveLength(46)
  })

  it('weakOnly restreint aux caractères sous le seuil de réussite quand il y en a', () => {
    const acc = new Map<string, KanaAccuracy>([
      ['あ', { seen: 5, correct: 1, accuracy: 0.2 }], // point faible
      ['い', { seen: 5, correct: 5, accuracy: 1 }], // maîtrisé
    ])
    const q = buildQueue({
      script: 'hiragana',
      groups: ['base'],
      length: 'all',
      weakOnly: true,
      accuracyById: acc,
    })
    expect(q.map((i) => i.char)).toContain('あ')
    expect(q.map((i) => i.char)).not.toContain('い')
  })
})

describe('makeChoices', () => {
  it('inclut toujours la bonne réponse et ne la duplique pas', () => {
    const all = pool('hiragana', ['base'])
    const item = all[0]!
    const choices = makeChoices(item, all, 4)
    expect(choices).toHaveLength(4)
    expect(choices.filter((c) => c === item.char)).toHaveLength(1)
    expect(new Set(choices).size).toBe(choices.length)
  })

  it('ne propose que des distracteurs du même script', () => {
    const all = pool('mixte', ['base'])
    const item = all.find((i) => i.type === 'hiragana')!
    const choices = makeChoices(item, all, 4)
    for (const c of choices) {
      const src = all.find((i) => i.char === c)!
      expect(src.type).toBe('hiragana')
    }
  })
})
