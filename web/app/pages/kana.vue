<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { KanaGroup } from '~/data/kana'
import {
  buildQueue,
  pool,
  type Direction,
  type DrillItem,
  type DrillResult,
  type Script,
} from '~/lib/kana-session'
import { useKanaStats } from '~/composables/useKanaStats'
import { bumpDailyStreak, getDailyStreak } from '~/lib/streak'

useHead({ title: 'Kana — Japonais' })

const { byChar, worked } = useKanaStats()

const view = ref<'config' | 'running' | 'done'>('config')

// --- Réglages de session ------------------------------------------------
const script = ref<Script>('hiragana')
const groups = ref<KanaGroup[]>(['base'])
const direction = ref<Direction>('kana2romaji')
const length = ref('20')
const weakOnly = ref(false)

const GROUPS: { value: KanaGroup; label: string }[] = [
  { value: 'base', label: 'Base (46)' },
  { value: 'dakuten', label: 'Dakuten ゛' },
  { value: 'handakuten', label: 'Handakuten ゜' },
  { value: 'yoon', label: 'Combinés ゃゅょ' },
]

function toggleGroup(g: KanaGroup) {
  const i = groups.value.indexOf(g)
  if (i === -1) groups.value = [...groups.value, g]
  else groups.value = groups.value.filter((x) => x !== g)
}

const poolCount = computed(() => pool(script.value, groups.value).length)
const canStart = computed(() => groups.value.length > 0 && poolCount.value > 0)

// --- Session courante -------------------------------------------------
const sessionItems = ref<DrillItem[]>([])
const sessionPool = ref<DrillItem[]>([])
const lastResult = ref<DrillResult | null>(null)
const streak = ref(0)

onMounted(async () => {
  streak.value = await getDailyStreak('kanaStreak')
})

function start() {
  if (!canStart.value) return
  sessionPool.value = pool(script.value, groups.value)
  sessionItems.value = buildQueue({
    script: script.value,
    groups: groups.value,
    length: length.value === 'all' ? 'all' : Number(length.value),
    weakOnly: weakOnly.value,
    accuracyById: byChar.value,
  })
  if (!sessionItems.value.length) return
  view.value = 'running'
}

async function onFinish(result: DrillResult) {
  lastResult.value = result
  streak.value = await bumpDailyStreak('kanaStreak')
  view.value = 'done'
}

function replayMissed() {
  if (!lastResult.value) return
  const missed = new Set(lastResult.value.missed)
  sessionItems.value = sessionPool.value.filter((i) => missed.has(i.char))
  if (!sessionItems.value.length) return
  view.value = 'running'
}
</script>

<template>
  <div>
    <PageHeader title="Drill kana" subtitle="Reconnaissance hiragana et katakana." />

    <!-- CONFIG -->
    <div v-if="view === 'config'" class="space-y-5">
      <div class="space-y-5 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-sm font-medium">Syllabaire</span>
          <SegmentedControl
            v-model="script"
            :options="[
              { value: 'hiragana', label: 'Hiragana' },
              { value: 'katakana', label: 'Katakana' },
              { value: 'mixte', label: 'Mixte' },
            ]"
          />
        </div>

        <div>
          <span class="text-sm font-medium">Groupes</span>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="g in GROUPS"
              :key="g.value"
              type="button"
              class="rounded-lg border px-3 py-1.5 text-sm font-medium transition"
              :class="
                groups.includes(g.value)
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
              "
              @click="toggleGroup(g.value)"
            >
              {{ g.label }}
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-sm font-medium">Sens</span>
          <SegmentedControl
            v-model="direction"
            :options="[
              { value: 'kana2romaji', label: 'Kana → rōmaji' },
              { value: 'romaji2kana', label: 'Rōmaji → kana' },
            ]"
          />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-sm font-medium">Longueur</span>
          <SegmentedControl
            v-model="length"
            :options="[
              { value: '20', label: '20' },
              { value: '50', label: '50' },
              { value: 'all', label: 'Tout' },
            ]"
          />
        </div>

        <div class="flex items-center justify-between gap-4">
          <span class="text-sm">
            <span class="font-medium">Points faibles seulement</span>
            <span class="block text-xs text-neutral-400">
              {{ worked > 0 ? 'caractères sous 80 % de réussite' : 'disponible après quelques sessions' }}
            </span>
          </span>
          <ToggleSwitch v-model="weakOnly" label="Points faibles seulement" />
        </div>
      </div>

      <button
        class="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canStart"
        @click="start"
      >
        Commencer · {{ length === 'all' ? poolCount : Math.min(Number(length), poolCount) }} caractères
      </button>

      <KanaHeatmap />
    </div>

    <!-- RUNNING -->
    <KanaDrill
      v-else-if="view === 'running'"
      :items="sessionItems"
      :pool="sessionPool"
      :direction="direction"
      @finish="onFinish"
      @quit="view = 'config'"
    />

    <!-- DONE -->
    <KanaResults
      v-else-if="view === 'done' && lastResult"
      :result="lastResult"
      :streak="streak"
      @replay="replayMissed"
      @again="start"
      @config="view = 'config'"
    />
  </div>
</template>
