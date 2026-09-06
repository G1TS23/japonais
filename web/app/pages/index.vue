<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getDb } from '~/lib/db'
import { State } from '~/lib/fsrs'
import { useLiveQuery } from '~/composables/useLiveQuery'
import { getDailyStreak } from '~/lib/streak'
import { currentPhase, getCheckedCriteria, phaseCompletion } from '~/lib/progress'

useHead({ title: 'Tableau de bord — Japonais' })

const db = getDb()

const kanaStreak = ref(0)
const srsStreak = ref(0)
onMounted(async () => {
  kanaStreak.value = await getDailyStreak('kanaStreak')
  srsStreak.value = await getDailyStreak('srsStreak')
})

const totalCards = useLiveQuery(() => db.cards.count(), 0)
const dueToday = useLiveQuery(
  () =>
    db.cards
      .where('due')
      .belowOrEqual(Date.now())
      .and((c) => !c.suspendue && c.state !== State.New)
      .count(),
  0,
)
const matureCards = useLiveQuery(() => db.cards.filter((c) => c.stability >= 21).count(), 0)
const kanaWorked = useLiveQuery(() => db.kanaStats.filter((k) => k.seen > 0).count(), 0)
const quizCount = useLiveQuery(() => db.quizAttempts.count(), 0)
const quizAccuracy = useLiveQuery(async () => {
  const all = await db.quizAttempts.toArray()
  const q = all.reduce((s, a) => s + a.total, 0)
  const c = all.reduce((s, a) => s + a.score, 0)
  return q ? Math.round((c / q) * 100) : 0
}, 0)

const checkedCriteria = useLiveQuery(() => getCheckedCriteria(), new Set<string>())
const phase = computed(() => currentPhase(checkedCriteria.value))
const completion = computed(() => phaseCompletion(phase.value, checkedCriteria.value))
</script>

<template>
  <div>
    <PageHeader
      title="Tableau de bord"
      subtitle="Vue d’ensemble de la progression. Toutes les données restent sur cet appareil."
    />

    <section class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard label="Cartes SRS" :value="totalCards" hint="vocabulaire au total" to="/srs" />
      <StatCard label="À réviser" :value="dueToday" hint="échéance aujourd’hui" to="/srs" />
      <StatCard label="Cartes matures" :value="matureCards" hint="stabilité ≥ 21 j" to="/srs" />
      <StatCard label="Série SRS" :value="srsStreak" hint="jours consécutifs" to="/srs" />
      <StatCard label="Kana travaillés" :value="kanaWorked" hint="caractères distincts" to="/kana" />
      <StatCard label="Série kana" :value="kanaStreak" hint="jours consécutifs" to="/kana" />
      <StatCard label="Quiz passés" :value="quizCount" to="/quiz" />
      <StatCard
        label="Réussite quiz"
        :value="quizCount ? `${quizAccuracy} %` : '—'"
        hint="toutes tentatives"
        to="/quiz"
      />
    </section>

    <NuxtLink
      :to="`/programme/${phase.id}`"
      class="mt-6 block rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-600"
    >
      <div class="text-xs font-medium tracking-wide text-neutral-400 uppercase">Phase en cours</div>
      <div class="mt-1 text-lg font-semibold">Phase {{ phase.number }} — {{ phase.title }}</div>
      <div v-if="completion.total" class="mt-2">
        <div class="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div class="h-full bg-brand-500" :style="{ width: `${completion.pct}%` }" />
        </div>
        <div class="mt-1 text-xs text-neutral-400">{{ completion.done }} / {{ completion.total }} critères de sortie</div>
      </div>
      <div class="mt-3 text-sm font-medium text-brand-600">Ouvrir la phase →</div>
    </NuxtLink>
  </div>
</template>
