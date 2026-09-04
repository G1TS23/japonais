<script setup lang="ts">
import { computed, ref } from 'vue'
import { KANA } from '~/data/kana'
import { useKanaStats } from '~/composables/useKanaStats'

const script = ref('hiragana')
const { byChar } = useKanaStats()

const ROW_LABELS: Record<string, string> = {
  a: 'あ',
  ka: 'か',
  sa: 'さ',
  ta: 'た',
  na: 'な',
  ha: 'は',
  ma: 'ま',
  ya: 'や',
  ra: 'ら',
  wa: 'わ',
  n: 'ん',
  dakuten: '゛',
  handakuten: '゜',
  yoon: 'ゃ',
}
const ROW_ORDER = Object.keys(ROW_LABELS)

const rows = computed(() => {
  const map = new Map<string, { char: string; romaji: string }[]>()
  for (const e of KANA) {
    const char = script.value === 'hiragana' ? e.hira : e.kata
    if (!map.has(e.row)) map.set(e.row, [])
    map.get(e.row)!.push({ char, romaji: e.romaji })
  }
  return ROW_ORDER.filter((r) => map.has(r)).map((r) => ({ row: r, label: ROW_LABELS[r], cells: map.get(r)! }))
})

function cellClass(char: string): string {
  const a = byChar.value.get(char)
  if (!a || a.seen === 0) return 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
  if (a.accuracy < 0.5) return 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-100'
  if (a.accuracy < 0.8) return 'bg-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100'
  return 'bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-100'
}

function cellTitle(char: string): string {
  const a = byChar.value.get(char)
  if (!a || a.seen === 0) return 'jamais vu'
  return `${a.seen} vue${a.seen > 1 ? 's' : ''} · ${Math.round(a.accuracy * 100)} %`
}
</script>

<template>
  <div class="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Maîtrise par caractère</h2>
      <SegmentedControl
        v-model="script"
        :options="[
          { value: 'hiragana', label: 'ひらがな' },
          { value: 'katakana', label: 'カタカナ' },
        ]"
      />
    </div>

    <div class="space-y-1.5 overflow-x-auto">
      <div v-for="r in rows" :key="r.row" class="flex items-center gap-1.5">
        <span class="jp w-6 shrink-0 text-center text-xs text-neutral-400">{{ r.label }}</span>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="c in r.cells"
            :key="c.char"
            :title="`${c.romaji} — ${cellTitle(c.char)}`"
            class="jp flex h-9 w-9 items-center justify-center rounded-md text-lg"
            :class="cellClass(c.char)"
          >
            {{ c.char }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap gap-3 text-xs text-neutral-400">
      <span class="flex items-center gap-1"><span class="h-3 w-3 rounded bg-neutral-200 dark:bg-neutral-700" /> jamais vu</span>
      <span class="flex items-center gap-1"><span class="h-3 w-3 rounded bg-red-300 dark:bg-red-800" /> &lt; 50 %</span>
      <span class="flex items-center gap-1"><span class="h-3 w-3 rounded bg-amber-300 dark:bg-amber-700" /> 50–80 %</span>
      <span class="flex items-center gap-1"><span class="h-3 w-3 rounded bg-green-300 dark:bg-green-800" /> ≥ 80 %</span>
    </div>
  </div>
</template>
