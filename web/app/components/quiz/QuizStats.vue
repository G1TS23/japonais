<script setup lang="ts">
import { computed } from 'vue'
import type { QuizStats } from '~/lib/quiz-session'
import type { QuizTheme } from '~/data/quiz-n5'

const props = defineProps<{ stats: QuizStats }>()

const THEME_LABEL: Record<QuizTheme, string> = {
  particules: 'Particules',
  grammaire: 'Grammaire',
  vocabulaire: 'Vocabulaire',
}

/** Les ~15 dernières tentatives pour le graphe. */
const chart = computed(() => props.stats.history.slice(-15))

const avgSeconds = computed(() =>
  props.stats.avgMsPerQuestion ? (props.stats.avgMsPerQuestion / 1000).toFixed(1) : null,
)

const themeRows = computed(() => {
  const e = props.stats.errorsByTheme
  const max = Math.max(e.particules, e.grammaire, e.vocabulaire, 1)
  return (['particules', 'grammaire', 'vocabulaire'] as QuizTheme[]).map((t) => ({
    theme: t,
    label: THEME_LABEL[t],
    count: e[t],
    width: Math.round((e[t] / max) * 100),
  }))
})
const totalErrors = computed(
  () => props.stats.errorsByTheme.particules + props.stats.errorsByTheme.grammaire + props.stats.errorsByTheme.vocabulaire,
)

function barColor(pct: number): string {
  if (pct >= 75) return 'bg-green-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}
</script>

<template>
  <div class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
    <h2 class="mb-4 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Statistiques</h2>

    <!-- Chiffres clés -->
    <dl class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div>
        <dt class="text-xs text-neutral-400">Réussite globale</dt>
        <dd class="mt-0.5 text-2xl font-semibold tabular-nums">{{ stats.accuracy }} %</dd>
        <dd class="text-xs text-neutral-400">{{ stats.totalCorrect }} / {{ stats.totalQuestions }} questions</dd>
      </div>
      <div>
        <dt class="text-xs text-neutral-400">Meilleur score</dt>
        <dd class="mt-0.5 text-2xl font-semibold tabular-nums">{{ stats.bestPct }} %</dd>
        <dd class="text-xs text-neutral-400">{{ stats.attempts }} tentative(s)</dd>
      </div>
      <div>
        <dt class="text-xs text-neutral-400">{{ stats.recentCount }} derniers</dt>
        <dd class="mt-0.5 text-2xl font-semibold tabular-nums">{{ stats.recentAccuracy }} %</dd>
        <dd class="text-xs text-neutral-400">
          <span v-if="stats.recentAccuracy > stats.accuracy" class="text-green-600 dark:text-green-400">
            +{{ stats.recentAccuracy - stats.accuracy }} pts
          </span>
          <span v-else-if="stats.recentAccuracy < stats.accuracy" class="text-red-600 dark:text-red-400">
            {{ stats.recentAccuracy - stats.accuracy }} pts
          </span>
          <span v-else>stable</span>
        </dd>
      </div>
      <div>
        <dt class="text-xs text-neutral-400">Temps / question</dt>
        <dd class="mt-0.5 text-2xl font-semibold tabular-nums">{{ avgSeconds ?? '—' }}<span v-if="avgSeconds" class="text-base"> s</span></dd>
      </div>
    </dl>

    <!-- Évolution -->
    <div v-if="chart.length >= 2" class="mt-6">
      <div class="mb-2 text-xs text-neutral-400">Évolution du score</div>
      <div class="flex h-24 items-end gap-1">
        <div
          v-for="(h, i) in chart"
          :key="i"
          class="flex-1 rounded-t"
          :class="barColor(h.pct)"
          :style="{ height: `${Math.max(h.pct, 3)}%` }"
          :title="`${new Date(h.ts).toLocaleDateString()} · ${h.pct} %`"
        />
      </div>
    </div>

    <!-- Points faibles -->
    <div class="mt-6">
      <div class="mb-2 text-xs text-neutral-400">Erreurs par thème</div>
      <p v-if="totalErrors === 0" class="text-sm text-neutral-500 dark:text-neutral-400">
        Aucune erreur enregistrée. 🎉
      </p>
      <div v-else class="space-y-1.5">
        <div v-for="row in themeRows" :key="row.theme" class="flex items-center gap-3 text-sm">
          <span class="w-24 shrink-0 text-neutral-500 dark:text-neutral-400">{{ row.label }}</span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div class="h-full rounded-full bg-brand-500" :style="{ width: `${row.width}%` }" />
          </div>
          <span class="w-6 shrink-0 text-right tabular-nums text-neutral-400">{{ row.count }}</span>
        </div>
      </div>
    </div>

    <!-- Questions récurrentes -->
    <div v-if="stats.toughest.length" class="mt-6">
      <div class="mb-2 text-xs text-neutral-400">Questions les plus ratées</div>
      <ul class="space-y-1.5 text-sm">
        <li v-for="q in stats.toughest" :key="q.id" class="flex items-baseline justify-between gap-3">
          <span class="jp truncate text-neutral-700 dark:text-neutral-300">{{ q.prompt }}</span>
          <span class="shrink-0 text-xs text-neutral-400">raté {{ q.misses }}×</span>
        </li>
      </ul>
    </div>
  </div>
</template>
