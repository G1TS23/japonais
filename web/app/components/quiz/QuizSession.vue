<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { QuizQuestion } from '~/lib/quiz-session'

const props = defineProps<{ questions: QuizQuestion[] }>()
const emit = defineEmits<{
  finish: [summary: { score: number; total: number; missed: string[]; durationMs: number }]
  quit: []
}>()

const index = ref(0)
const picked = ref<number | null>(null)
const score = ref(0)
const missed = ref<string[]>([])
const startedAt = Date.now()

const current = computed<QuizQuestion | undefined>(() => props.questions[index.value])
const total = props.questions.length
const answered = computed(() => picked.value !== null)
const isCorrect = computed(() => answered.value && picked.value === current.value?.answer)

watch(current, () => {
  picked.value = null
})

function pick(i: number) {
  if (answered.value || !current.value) return
  picked.value = i
  if (i === current.value.answer) score.value++
  else missed.value.push(current.value.id)
}

function next() {
  if (!answered.value) return
  if (index.value + 1 >= total) {
    emit('finish', { score: score.value, total, missed: [...missed.value], durationMs: Date.now() - startedAt })
    return
  }
  index.value++
}

function onKey(e: KeyboardEvent) {
  if (!current.value) return
  if (!answered.value) {
    const n = Number(e.key)
    if (n >= 1 && n <= current.value.options.length) pick(n - 1)
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    next()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function optionClass(i: number): string {
  if (!answered.value) {
    return 'border-neutral-300 hover:border-brand-400 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/60'
  }
  if (i === current.value?.answer) return 'border-green-500 bg-green-50 dark:bg-green-950/40'
  if (i === picked.value) return 'border-red-500 bg-red-50 dark:bg-red-950/40'
  return 'border-neutral-200 opacity-60 dark:border-neutral-800'
}
</script>

<template>
  <div v-if="current" class="mx-auto max-w-md">
    <div class="mb-1 text-xs text-neutral-500 dark:text-neutral-400">{{ index + 1 }} / {{ total }}</div>
    <div class="mb-5 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
      <div class="h-full bg-brand-500 transition-all" :style="{ width: `${Math.round((index / total) * 100)}%` }" />
    </div>

    <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div class="jp text-center text-xl">{{ current.prompt }}</div>
      <div v-if="current.hint" class="mt-1 text-center text-sm text-neutral-400">{{ current.hint }}</div>

      <div class="mt-5 grid gap-2">
        <button
          v-for="(opt, i) in current.options"
          :key="i"
          class="jp flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-base transition"
          :class="optionClass(i)"
          @click="pick(i)"
        >
          <span class="text-xs text-neutral-400">{{ i + 1 }}</span>
          <span>{{ opt }}</span>
        </button>
      </div>

      <div v-if="answered" class="mt-4 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800/60">
        <span :class="isCorrect ? 'font-medium text-green-600 dark:text-green-400' : 'font-medium text-red-600 dark:text-red-400'">
          {{ isCorrect ? 'Correct' : 'Faux' }}
        </span>
        <template v-if="current.explanation"> — {{ current.explanation }}</template>
      </div>

      <button
        v-if="answered"
        class="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        @click="next"
      >
        {{ index + 1 >= total ? 'Voir le résultat' : 'Suivant' }}
      </button>
    </div>

    <p class="mt-3 text-center text-xs text-neutral-400">1-4 pour répondre · Entrée pour continuer</p>

    <button
      class="mt-3 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
      @click="emit('quit')"
    >
      Quitter
    </button>
  </div>
</template>
