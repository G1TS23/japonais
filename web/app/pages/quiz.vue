<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  buildQuiz,
  poolSize,
  recentQuizAttempts,
  recordQuizAttempt,
  shuffleOptions,
  THEMES,
  type QuizQuestion,
  type QuizTheme,
} from '~/lib/quiz-session'
import { useSettingsStore } from '~/stores/settings'

useHead({ title: 'Quiz — Japonais' })

const settings = useSettingsStore()
onMounted(async () => {
  await settings.load()
  attempts.value = await recentQuizAttempts(5)
})

const view = ref<'config' | 'running' | 'done'>('config')
const themes = ref<QuizTheme[]>(['particules', 'grammaire', 'vocabulaire'])
const length = ref('10')

type Summary = { score: number; total: number; missed: string[]; durationMs: number }
const questions = ref<QuizQuestion[]>([])
const lastSummary = ref<Summary | null>(null)
const attempts = ref<Awaited<ReturnType<typeof recentQuizAttempts>>>([])

const available = computed(() => poolSize(themes.value))
const canStart = computed(() => themes.value.length > 0)

function toggleTheme(t: QuizTheme) {
  themes.value = themes.value.includes(t) ? themes.value.filter((x) => x !== t) : [...themes.value, t]
}

function start() {
  if (!canStart.value) return
  questions.value = buildQuiz({
    themes: themes.value,
    length: length.value === 'all' ? 'all' : Number(length.value),
    lang: settings.values.sensLang,
  })
  if (!questions.value.length) return
  view.value = 'running'
}

async function onFinish(summary: Summary) {
  lastSummary.value = summary
  await recordQuizAttempt({
    palier: 'n5',
    themes: themes.value,
    score: summary.score,
    total: summary.total,
    missed: summary.missed,
  })
  attempts.value = await recentQuizAttempts(5)
  view.value = 'done'
}

const missedQuestions = computed(() =>
  lastSummary.value ? questions.value.filter((q) => lastSummary.value!.missed.includes(q.id)) : [],
)

function replayMissed() {
  if (!missedQuestions.value.length) return
  questions.value = missedQuestions.value.map(shuffleOptions)
  view.value = 'running'
}
</script>

<template>
  <div>
    <PageHeader title="Quiz par palier" subtitle="QCM particules, grammaire et vocabulaire — N5 pour l'instant." />

    <div v-if="view === 'config'" class="space-y-5">
      <div class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div class="grid gap-x-8 gap-y-5 md:grid-cols-2">
          <SettingField label="Thèmes">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="t in THEMES"
                :key="t.value"
                type="button"
                class="rounded-lg border px-3 py-1.5 text-sm font-medium transition"
                :class="
                  themes.includes(t.value)
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
                "
                @click="toggleTheme(t.value)"
              >
                {{ t.label }}
              </button>
            </div>
          </SettingField>

          <SettingField label="Longueur">
            <SegmentedControl
              v-model="length"
              :options="[
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: 'all', label: 'Tout' },
              ]"
            />
          </SettingField>
        </div>
      </div>

      <button
        class="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canStart"
        @click="start"
      >
        Commencer · {{ length === 'all' ? available : Math.min(Number(length), available) }} questions
      </button>

      <div
        v-if="attempts.length"
        class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 class="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Tentatives récentes</h2>
        <ul class="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          <li v-for="a in attempts" :key="a.id" class="flex justify-between">
            <span>{{ new Date(a.ts).toLocaleDateString() }} · {{ a.themes.join(', ') }}</span>
            <span class="tabular-nums">{{ a.score }} / {{ a.total }}</span>
          </li>
        </ul>
      </div>
    </div>

    <QuizSession v-else-if="view === 'running'" :questions="questions" @finish="onFinish" @quit="view = 'config'" />

    <QuizResults
      v-else-if="view === 'done' && lastSummary"
      :summary="lastSummary"
      :missed-questions="missedQuestions"
      @replay="replayMissed"
      @again="start"
      @config="view = 'config'"
    />
  </div>
</template>
