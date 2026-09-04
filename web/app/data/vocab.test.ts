import { describe, expect, it } from 'vitest'
import { VOCAB_N5 } from './vocab'

describe('deck de vocabulaire N5', () => {
  it('contient 718 entrées', () => {
    expect(VOCAB_N5.length).toBe(718)
  })

  it('a des content_id uniques', () => {
    const ids = VOCAB_N5.map((e) => e.content_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('a des champs de base non vides pour chaque entrée', () => {
    for (const e of VOCAB_N5) {
      expect(e.terme, e.content_id).toBeTruthy()
      expect(e.lecture, e.content_id).toBeTruthy()
      expect(e.sens_en, e.content_id).toBeTruthy()
      expect(e.tags.length, e.content_id).toBeGreaterThan(0)
    }
  })

  it('a un sens français pour chaque entrée, avec sa source tracée', () => {
    for (const e of VOCAB_N5) {
      expect(e.sens_fr, e.content_id).toBeTruthy()
      expect(['jmdict', 'manuel'], e.content_id).toContain(e.sens_fr_source)
    }
  })
})
