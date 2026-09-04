<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getDb } from '~/lib/db'
import { State } from '~/lib/fsrs'
import { useLiveQuery } from '~/composables/useLiveQuery'
import { getDailyStreak } from '~/lib/streak'

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

const currentPhase = useLiveQuery(
  async () => (await db.progress.get('currentPhase'))?.value as string | undefined,
  undefined,
)
const phaseLabel = computed(() => currentPhase.value ?? 'Phase 0 — Fondations')

const shortcuts = [
  { to: '/kana', label: 'Drill kana', desc: 'Reconnaissance hiragana / katakana' },
  { to: '/srs', label: 'Réviser (SRS)', desc: 'File de révision du jour' },
  { to: '/quiz', label: 'Quiz', desc: 'QCM par palier JLPT' },
  { to: '/programme', label: 'Programme', desc: 'Phases, critères, jalons' },
]
</script>

<template>
  <div>
    <PageHeader
      title="Tableau de bord"
      subtitle="Vue d’ensemble de la progression. Toutes les données restent sur cet appareil."
    />

    <section class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard label="Cartes SRS" :value="totalCards" hint="vocabulaire au total" />
      <StatCard label="À réviser" :value="dueToday" hint="échéance aujourd’hui" />
      <StatCard label="Cartes matures" :value="matureCards" hint="stabilité ≥ 21 j" />
      <StatCard label="Série SRS" :value="srsStreak" hint="jours consécutifs" />
      <StatCard label="Kana travaillés" :value="kanaWorked" hint="caractères distincts" />
      <StatCard label="Série kana" :value="kanaStreak" hint="jours consécutifs" />
      <StatCard label="Quiz passés" :value="quizCount" />
    </section>

    <section class="mt-6 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div class="text-xs font-medium tracking-wide text-neutral-400 uppercase">Phase en cours</div>
      <div class="mt-1 text-lg font-semibold">{{ phaseLabel }}</div>
      <NuxtLink to="/programme" class="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline">
        Ouvrir le programme →
      </NuxtLink>
    </section>

    <section class="mt-6">
      <h2 class="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Accès rapides</h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <NuxtLink
          v-for="s in shortcuts"
          :key="s.to"
          :to="s.to"
          class="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-brand-400 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-600"
        >
          <div class="font-medium">{{ s.label }}</div>
          <div class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{{ s.desc }}</div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
