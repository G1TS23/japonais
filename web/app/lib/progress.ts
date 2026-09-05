import { MILESTONES, PHASES, type Phase } from '~/data/programme'
import { getDb, type StudyLogEntry } from './db'

const CRITERION_PREFIX = 'criterion:'
const MILESTONE_PREFIX = 'milestone:'

// --- Critères de sortie ----------------------------------------------------

export async function getCheckedCriteria(): Promise<Set<string>> {
  const db = getDb()
  const rows = await db.progress.where('key').startsWith(CRITERION_PREFIX).toArray()
  const set = new Set<string>()
  for (const r of rows) if (r.value) set.add(r.key.slice(CRITERION_PREFIX.length))
  return set
}

export async function setCriterionChecked(id: string, checked: boolean): Promise<void> {
  await getDb().progress.put({ key: `${CRITERION_PREFIX}${id}`, value: checked, updated_at: Date.now() })
}

export interface PhaseCompletion {
  done: number
  total: number
  pct: number
}

export function phaseCompletion(phase: Phase, checked: Set<string>): PhaseCompletion {
  const total = phase.exitCriteria.length
  const done = phase.exitCriteria.filter((c) => checked.has(c.id)).length
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

/**
 * Première phase dont les critères de sortie ne sont pas tous validés (les
 * phases sans critère, comme la 5, sont ignorées pour ce calcul). Renvoie la
 * dernière phase si tout est coché.
 */
export function currentPhase(checked: Set<string>): Phase {
  for (const phase of PHASES) {
    if (phase.exitCriteria.length === 0) continue
    const { done, total } = phaseCompletion(phase, checked)
    if (done < total) return phase
  }
  return PHASES[PHASES.length - 1]!
}

// --- Jalons transversaux ----------------------------------------------------

export interface MilestoneState {
  checked: boolean
  date: string | null
}

const EMPTY_MILESTONE: MilestoneState = { checked: false, date: null }

export async function getMilestoneStates(): Promise<Map<string, MilestoneState>> {
  const db = getDb()
  const rows = await db.progress.where('key').startsWith(MILESTONE_PREFIX).toArray()
  const map = new Map<string, MilestoneState>()
  for (const r of rows) map.set(r.key.slice(MILESTONE_PREFIX.length), r.value as MilestoneState)
  return map
}

export function milestoneState(states: Map<string, MilestoneState>, id: string): MilestoneState {
  return states.get(id) ?? EMPTY_MILESTONE
}

export async function setMilestoneChecked(id: string, checked: boolean, now: Date = new Date()): Promise<void> {
  const value: MilestoneState = { checked, date: checked ? now.toISOString().slice(0, 10) : null }
  await getDb().progress.put({ key: `${MILESTONE_PREFIX}${id}`, value, updated_at: now.getTime() })
}

export function milestonesDone(states: Map<string, MilestoneState>): number {
  return MILESTONES.filter((m) => milestoneState(states, m.id).checked).length
}

// --- Journal d'étude ---------------------------------------------------------

export async function upsertStudyLog(entry: StudyLogEntry): Promise<void> {
  await getDb().studyLog.put(entry)
}

export async function recentStudyLogs(limit = 8): Promise<StudyLogEntry[]> {
  return getDb().studyLog.orderBy('date').reverse().limit(limit).toArray()
}

export async function getStudyLog(date: string): Promise<StudyLogEntry | undefined> {
  return getDb().studyLog.get(date)
}
