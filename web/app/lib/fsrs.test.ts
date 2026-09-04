import { describe, expect, it } from 'vitest'
import { State, applyRating, newFsrsFields, previewRatings, Rating } from './fsrs'
import type { Card } from './db'

const NOW = new Date('2026-01-01T12:00:00Z')

function baseCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'c1',
    terme: '食べる',
    lecture: 'たべる',
    sens_fr: 'manger',
    sens_fr_source: 'jmdict',
    sens_en: 'to eat',
    tags: ['n5'],
    suspendue: false,
    created_at: NOW.getTime(),
    ...newFsrsFields(NOW),
    ...overrides,
  }
}

describe('newFsrsFields', () => {
  it('crée une carte neuve, due immédiatement', () => {
    const f = newFsrsFields(NOW)
    expect(f.state).toBe(State.New)
    expect(f.due).toBe(NOW.getTime())
    expect(f.reps).toBe(0)
    expect(f.lapses).toBe(0)
  })
})

describe('previewRatings', () => {
  it('renvoie les 4 notes, avec des échéances strictement croissantes pour une carte neuve', () => {
    const card = baseCard()
    const preview = previewRatings(card, 0.9, NOW)
    expect(preview.map((p) => p.rating)).toEqual([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy])
    const dues = preview.map((p) => p.due)
    for (let i = 1; i < dues.length; i++) {
      expect(dues[i]).toBeGreaterThan(dues[i - 1]!)
    }
  })

  it('chaque échéance prévisualisée est dans le futur', () => {
    const card = baseCard()
    const preview = previewRatings(card, 0.9, NOW)
    for (const p of preview) expect(p.due).toBeGreaterThan(NOW.getTime())
  })
})

describe('applyRating', () => {
  it('fait sortir une carte neuve de l’état New après une note', () => {
    const card = baseCard()
    const { card: fields } = applyRating(card, 0.9, Rating.Good, NOW)
    expect(fields.state).not.toBe(State.New)
    expect(fields.reps).toBe(1)
    expect(fields.due).toBeGreaterThan(NOW.getTime())
  })

  it('incrémente lapses quand "Again" est appliqué à une carte en révision', () => {
    // Fait mûrir la carte avec plusieurs "Good" jusqu'à l'état Review.
    let card = baseCard()
    let when = NOW
    for (let i = 0; i < 4; i++) {
      const { card: fields } = applyRating(card, 0.9, Rating.Good, when)
      card = { ...card, ...fields }
      when = new Date(fields.due)
    }
    expect(card.state).toBe(State.Review)
    expect(card.lapses).toBe(0)

    const { card: afterAgain } = applyRating(card, 0.9, Rating.Again, when)
    expect(afterAgain.lapses).toBe(1)
    expect(afterAgain.state).toBe(State.Relearning)
  })

  it('une cible de rétention plus haute programme des intervalles plus courts (Good)', () => {
    const card = baseCard()
    const loose = applyRating(card, 0.75, Rating.Good, NOW).card.due
    const strict = applyRating(card, 0.97, Rating.Good, NOW).card.due
    expect(strict).toBeLessThanOrEqual(loose)
  })
})
