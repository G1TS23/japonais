import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Rating, State } from 'ts-fsrs'
import { getDb, uid, type Card } from './db'
import { newFsrsFields } from './fsrs'
import {
  displaySens,
  getTodayQueue,
  newCardsIntroducedToday,
  recordReview,
  seedDeckIfEmpty,
} from './srs-session'
import type { VocabEntry } from '~/data/vocab'

const NOW = new Date('2026-01-10T12:00:00Z')

const SAMPLE_VOCAB: VocabEntry[] = [
  { content_id: 'a', terme: '食べる', lecture: 'たべる', sens_en: 'to eat', sens_fr: 'manger', sens_fr_source: 'jmdict', tags: ['n5'] },
  { content_id: 'b', terme: '飲む', lecture: 'のむ', sens_en: 'to drink', sens_fr: null, sens_fr_source: null, tags: ['n5'] },
  { content_id: 'c', terme: '見る', lecture: 'みる', sens_en: 'to see', sens_fr: null, sens_fr_source: null, tags: ['n5'] },
]

function manualCard(overrides: Partial<Card> = {}): Card {
  return {
    id: uid(),
    terme: 'X',
    lecture: 'x',
    sens_fr: null,
    sens_fr_source: null,
    sens_en: 'x',
    tags: ['n5'],
    suspendue: false,
    created_at: NOW.getTime(),
    ...newFsrsFields(NOW),
    ...overrides,
  }
}

beforeEach(async () => {
  const db = getDb()
  await db.cards.clear()
  await db.reviewLogs.clear()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('seedDeckIfEmpty', () => {
  it('importe le deck fourni quand la base est vide', async () => {
    const n = await seedDeckIfEmpty(SAMPLE_VOCAB, NOW)
    expect(n).toBe(3)
    expect(await getDb().cards.count()).toBe(3)
    const all = await getDb().cards.toArray()
    expect(all.find((c) => c.content_id === 'a')?.terme).toBe('食べる')
    expect(all.every((c) => c.state === State.New)).toBe(true)
  })

  it("n'importe rien si des cartes existent déjà (pas de doublon)", async () => {
    await seedDeckIfEmpty(SAMPLE_VOCAB, NOW)
    const second = await seedDeckIfEmpty(SAMPLE_VOCAB, NOW)
    expect(second).toBe(0)
    expect(await getDb().cards.count()).toBe(3)
  })
})

describe('getTodayQueue', () => {
  it('plafonne les nouvelles cartes au réglage newCardsPerDay', async () => {
    await seedDeckIfEmpty(SAMPLE_VOCAB, NOW)
    const q = await getTodayQueue(2, NOW)
    expect(q.fresh).toHaveLength(2)
    expect(q.due).toHaveLength(0)
  })

  it('inclut les cartes en révision dont l’échéance est passée, exclut celles dans le futur', async () => {
    const db = getDb()
    await db.cards.bulkAdd([
      manualCard({ id: 'past', state: State.Review, due: NOW.getTime() - 1000 }),
      manualCard({ id: 'future', state: State.Review, due: NOW.getTime() + 1000 * 60 * 60 * 24 }),
    ])
    const q = await getTodayQueue(10, NOW)
    expect(q.due.map((c) => c.id)).toEqual(['past'])
  })

  it('exclut les cartes suspendues', async () => {
    const db = getDb()
    await db.cards.bulkAdd([manualCard({ id: 'susp', state: State.Review, due: NOW.getTime() - 1000, suspendue: true })])
    const q = await getTodayQueue(10, NOW)
    expect(q.due).toHaveLength(0)
  })

  it('déduit le budget de nouvelles cartes déjà introduites aujourd’hui', async () => {
    await seedDeckIfEmpty(SAMPLE_VOCAB, NOW)
    const [first] = (await getDb().cards.toArray())
    await recordReview(first!, 0.9, Rating.Good, NOW)

    const q = await getTodayQueue(2, NOW)
    expect(q.fresh).toHaveLength(1) // 2 - 1 déjà introduite
  })
})

describe('recordReview', () => {
  it('persiste la carte mise à jour et un journal de révision', async () => {
    const db = getDb()
    const card = manualCard({ id: 'r1' })
    await db.cards.add(card)

    const updated = await recordReview(card, 0.9, Rating.Good, NOW)
    expect(updated.state).not.toBe(State.New)
    expect((await db.cards.get('r1'))?.state).toBe(updated.state)

    const logs = await db.reviewLogs.where('cardId').equals('r1').toArray()
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({ cardId: 'r1', rating: Rating.Good, priorState: State.New })
  })
})

describe('newCardsIntroducedToday', () => {
  it('compte les cartes revues pour la première fois aujourd’hui', async () => {
    const db = getDb()
    const a = manualCard({ id: 'a' })
    const b = manualCard({ id: 'b' })
    await db.cards.bulkAdd([a, b])

    expect(await newCardsIntroducedToday(NOW)).toBe(0)
    await recordReview(a, 0.9, Rating.Good, NOW)
    expect(await newCardsIntroducedToday(NOW)).toBe(1)
    await recordReview(b, 0.9, Rating.Again, NOW)
    expect(await newCardsIntroducedToday(NOW)).toBe(2)
  })
})

describe('displaySens', () => {
  it('renvoie le français quand disponible et demandé', () => {
    expect(displaySens({ sens_fr: 'manger', sens_en: 'to eat' }, 'fr')).toEqual({ text: 'manger', isFallback: false })
  })

  it("replie sur l'anglais quand le français manque", () => {
    expect(displaySens({ sens_fr: null, sens_en: 'to eat' }, 'fr')).toEqual({ text: 'to eat', isFallback: true })
  })

  it("renvoie toujours l'anglais quand demandé explicitement", () => {
    expect(displaySens({ sens_fr: 'manger', sens_en: 'to eat' }, 'en')).toEqual({ text: 'to eat', isFallback: false })
  })
})
