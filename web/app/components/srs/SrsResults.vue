<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  summary: { total: number; again: number; hard: number; good: number; easy: number; durationMs: number }
  streak: number
}>()
const emit = defineEmits<{ again: []; done: [] }>()

const seconds = computed(() => Math.round(props.summary.durationMs / 1000))
const remembered = computed(() => props.summary.total - props.summary.again)
const pct = computed(() => (props.summary.total ? Math.round((remembered.value / props.summary.total) * 100) : 0))
</script>

<template>
  <div class="mx-auto max-w-md">
    <div class="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div class="text-5xl font-semibold tabular-nums">{{ pct }}%</div>
      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {{ summary.total }} carte{{ summary.total > 1 ? 's' : '' }} révisée{{ summary.total > 1 ? 's' : '' }} · {{ seconds }} s
      </p>
      <p v-if="streak > 0" class="mt-2 text-sm">🔥 Série : {{ streak }} jour{{ streak > 1 ? 's' : '' }}</p>

      <div class="mt-6 grid grid-cols-4 gap-2 text-sm">
        <div class="rounded-lg bg-red-50 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <div class="text-lg font-semibold">{{ summary.again }}</div>
          Again
        </div>
        <div class="rounded-lg bg-amber-50 py-2 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <div class="text-lg font-semibold">{{ summary.hard }}</div>
          Hard
        </div>
        <div class="rounded-lg bg-green-50 py-2 text-green-700 dark:bg-green-950/40 dark:text-green-300">
          <div class="text-lg font-semibold">{{ summary.good }}</div>
          Good
        </div>
        <div class="rounded-lg bg-blue-50 py-2 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <div class="text-lg font-semibold">{{ summary.easy }}</div>
          Easy
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-2">
        <button
          class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          @click="emit('again')"
        >
          Continuer les révisions
        </button>
        <button
          class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          @click="emit('done')"
        >
          Terminer
        </button>
      </div>
    </div>
  </div>
</template>
