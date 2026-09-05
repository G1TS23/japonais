import { beforeEach, describe, expect, it } from 'vitest'
import { MILESTONES, PHASES } from '~/data/programme'
import { getDb } from './db'
import {
  currentPhase,
  getCheckedCriteria,
  getMilestoneStates,
  getStudyLog,
  milestonesDone,
  milestoneState,
  phaseCompletion,
  recentStudyLogs,
  setCriterionChecked,
  setMilestoneChecked,
  upsertStudyLog,
} from './progress'

beforeEach(async () => {
  const db = getDb()
  await db.progress.clear()
  await db.studyLog.clear()
})

describe('jeu de données programme', () => {
  it('a 6 phases numérotées 0 à 5', () => {
    expect(PHASES.map((p) => p.number)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('a des ids de critères de sortie uniques dans tout le programme', () => {
    const ids = PHASES.flatMap((p) => p.exitCriteria.map((c) => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('a des ids de jalons uniques', () => {
    const ids = MILESTONES.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('phaseCompletion', () => {
  it('0/total quand rien n’est coché', () => {
    const c = phaseCompletion(PHASES[1]!, new Set())
    expect(c.done).toBe(0)
    expect(c.total).toBe(PHASES[1]!.exitCriteria.length)
    expect(c.pct).toBe(0)
  })

  it('100% quand tous les critères de la phase sont cochés', () => {
    const phase = PHASES[1]!
    const checked = new Set(phase.exitCriteria.map((c) => c.id))
    expect(phaseCompletion(phase, checked)).toEqual({ done: checked.size, total: checked.size, pct: 100 })
  })

  it('pct à 0 pour une phase sans critère (ex. phase 5), pas de division par zéro', () => {
    const phase = PHASES.find((p) => p.exitCriteria.length === 0)!
    expect(phaseCompletion(phase, new Set()).pct).toBe(0)
  })
})

describe('currentPhase', () => {
  it('renvoie la phase 0 quand rien n’est coché', () => {
    expect(currentPhase(new Set()).id).toBe('p0')
  })

  it('avance à la phase suivante une fois la précédente entièrement cochée', () => {
    const checked = new Set(PHASES[0]!.exitCriteria.map((c) => c.id))
    expect(currentPhase(checked).id).toBe('p1')
  })

  it('renvoie la dernière phase quand tout est coché', () => {
    const checked = new Set(PHASES.flatMap((p) => p.exitCriteria.map((c) => c.id)))
    expect(currentPhase(checked).id).toBe(PHASES[PHASES.length - 1]!.id)
  })
})

describe('critères de sortie (persistance)', () => {
  it('coche puis décoche un critère', async () => {
    await setCriterionChecked('p1-1', true)
    expect((await getCheckedCriteria()).has('p1-1')).toBe(true)
    await setCriterionChecked('p1-1', false)
    expect((await getCheckedCriteria()).has('p1-1')).toBe(false)
  })
})

describe('jalons (persistance)', () => {
  it('enregistre la date à la coche, la retire au décoché', async () => {
    const now = new Date('2026-02-01T10:00:00Z')
    await setMilestoneChecked('m1', true, now)
    let states = await getMilestoneStates()
    expect(milestoneState(states, 'm1')).toEqual({ checked: true, date: '2026-02-01' })

    await setMilestoneChecked('m1', false, now)
    states = await getMilestoneStates()
    expect(milestoneState(states, 'm1')).toEqual({ checked: false, date: null })
  })

  it('milestoneState renvoie un état vide pour un jalon jamais touché', async () => {
    const states = await getMilestoneStates()
    expect(milestoneState(states, 'm19')).toEqual({ checked: false, date: null })
  })

  it('milestonesDone compte les jalons cochés', async () => {
    await setMilestoneChecked('m1', true)
    await setMilestoneChecked('m2', true)
    expect(milestonesDone(await getMilestoneStates())).toBe(2)
  })
})

describe('journal d’étude', () => {
  it('enregistre et relit une entrée par date', async () => {
    await upsertStudyLog({ date: '2026-02-01', minutes_actives: 30, minutes_immersion: 15, note: 'Genki L5' })
    expect(await getStudyLog('2026-02-01')).toEqual({
      date: '2026-02-01',
      minutes_actives: 30,
      minutes_immersion: 15,
      note: 'Genki L5',
    })
  })

  it('remplace (une entrée par jour) plutôt que d’en accumuler plusieurs', async () => {
    await upsertStudyLog({ date: '2026-02-01', minutes_actives: 10, minutes_immersion: 0 })
    await upsertStudyLog({ date: '2026-02-01', minutes_actives: 25, minutes_immersion: 10 })
    expect(await getDb().studyLog.count()).toBe(1)
    expect((await getStudyLog('2026-02-01'))?.minutes_actives).toBe(25)
  })

  it('recentStudyLogs renvoie les plus récentes en premier, plafonné', async () => {
    for (const d of ['2026-01-01', '2026-01-03', '2026-01-02']) {
      await upsertStudyLog({ date: d, minutes_actives: 1, minutes_immersion: 0 })
    }
    const rows = await recentStudyLogs(2)
    expect(rows.map((r) => r.date)).toEqual(['2026-01-03', '2026-01-02'])
  })
})
