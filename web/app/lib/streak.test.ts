import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDb } from './db'
import { bumpDailyStreak, getDailyStreak } from './streak'

const DAY_MS = 24 * 60 * 60 * 1000
const START = new Date('2026-01-10T12:00:00Z') // midi UTC : marge de sécurité sur les bords de journée

function setDay(offsetDays: number) {
  vi.setSystemTime(new Date(START.getTime() + offsetDays * DAY_MS))
}

beforeEach(async () => {
  await getDb().progress.clear()
  // Ne truquer que Date : setTimeout/microtasks doivent rester réels pour que
  // Dexie (IndexedDB) puisse résoudre ses transactions asynchrones.
  vi.useFakeTimers({ toFake: ['Date'] })
  setDay(0)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('bumpDailyStreak', () => {
  it('démarre à 1 le premier jour', async () => {
    expect(await bumpDailyStreak('t')).toBe(1)
  })

  it("n'incrémente pas deux fois le même jour", async () => {
    await bumpDailyStreak('t')
    expect(await bumpDailyStreak('t')).toBe(1)
  })

  it('incrémente sur des jours consécutifs', async () => {
    await bumpDailyStreak('t')
    setDay(1)
    expect(await bumpDailyStreak('t')).toBe(2)
    setDay(2)
    expect(await bumpDailyStreak('t')).toBe(3)
  })

  it('réinitialise à 1 après un jour sauté', async () => {
    await bumpDailyStreak('t')
    setDay(1)
    await bumpDailyStreak('t')
    setDay(3) // jour 2 sauté
    expect(await bumpDailyStreak('t')).toBe(1)
  })

  it('des clés différentes ont des séries indépendantes', async () => {
    await bumpDailyStreak('kana')
    await bumpDailyStreak('kana')
    expect(await bumpDailyStreak('srs')).toBe(1)
  })
})

describe('getDailyStreak', () => {
  it('renvoie 0 sans historique', async () => {
    expect(await getDailyStreak('t')).toBe(0)
  })

  it('renvoie la série si vue aujourd’hui ou hier', async () => {
    await bumpDailyStreak('t')
    expect(await getDailyStreak('t')).toBe(1)
    setDay(1)
    expect(await getDailyStreak('t')).toBe(1) // hier -> encore valable
  })

  it('renvoie 0 si la série est cassée (plus de 1 jour sans activité)', async () => {
    await bumpDailyStreak('t')
    setDay(2)
    expect(await getDailyStreak('t')).toBe(0)
  })
})
