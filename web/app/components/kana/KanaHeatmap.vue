<script setup lang="ts">
import { computed, ref } from 'vue'
import { KANA } from '~/data/kana'
import { useKanaStats } from '~/composables/useKanaStats'

const script = ref('hiragana')
const { byChar } = useKanaStats()

interface ColumnDef {
  label: string
  /** Un hiragana par voyelle (a,i,u,e,o — ou ゃ,ゅ,ょ pour les combinaisons), null = case vide. */
  hira: (string | null)[]
}

// Tableau classique du gojūon : consonnes en colonnes, voyelles en lignes.
// Dakuten/handakuten intégrées juste après leur base (か→が, さ→ざ, た→だ,
// は→ば→ぱ) plutôt qu'à part.
const VOWEL_LABELS = ['あ', 'い', 'う', 'え', 'お']
const COLUMNS: ColumnDef[] = [
  { label: 'あ', hira: ['あ', 'い', 'う', 'え', 'お'] },
  { label: 'か', hira: ['か', 'き', 'く', 'け', 'こ'] },
  { label: 'が', hira: ['が', 'ぎ', 'ぐ', 'げ', 'ご'] },
  { label: 'さ', hira: ['さ', 'し', 'す', 'せ', 'そ'] },
  { label: 'ざ', hira: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'] },
  { label: 'た', hira: ['た', 'ち', 'つ', 'て', 'と'] },
  { label: 'だ', hira: ['だ', 'ぢ', 'づ', 'で', 'ど'] },
  { label: 'な', hira: ['な', 'に', 'ぬ', 'ね', 'の'] },
  { label: 'は', hira: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
  { label: 'ば', hira: ['ば', 'び', 'ぶ', 'べ', 'ぼ'] },
  { label: 'ぱ', hira: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'] },
  { label: 'ま', hira: ['ま', 'み', 'む', 'め', 'も'] },
  { label: 'や', hira: ['や', null, 'ゆ', null, 'よ'] },
  { label: 'ら', hira: ['ら', 'り', 'る', 'れ', 'ろ'] },
  { label: 'わ', hira: ['わ', null, null, null, 'を'] },
  { label: 'ん', hira: ['ん', null, null, null, null] },
]

const YOON_LABELS = ['ゃ', 'ゅ', 'ょ']
const YOON_COLUMNS: ColumnDef[] = [
  { label: 'きゃ', hira: ['きゃ', 'きゅ', 'きょ'] },
  { label: 'ぎゃ', hira: ['ぎゃ', 'ぎゅ', 'ぎょ'] },
  { label: 'しゃ', hira: ['しゃ', 'しゅ', 'しょ'] },
  { label: 'じゃ', hira: ['じゃ', 'じゅ', 'じょ'] },
  { label: 'ちゃ', hira: ['ちゃ', 'ちゅ', 'ちょ'] },
  { label: 'にゃ', hira: ['にゃ', 'にゅ', 'にょ'] },
  { label: 'ひゃ', hira: ['ひゃ', 'ひゅ', 'ひょ'] },
  { label: 'びゃ', hira: ['びゃ', 'びゅ', 'びょ'] },
  { label: 'ぴゃ', hira: ['ぴゃ', 'ぴゅ', 'ぴょ'] },
  { label: 'みゃ', hira: ['みゃ', 'みゅ', 'みょ'] },
  { label: 'りゃ', hira: ['りゃ', 'りゅ', 'りょ'] },
]

// hiragana -> entrée complète (kata, romaji…) : les caractères ne sont écrits
// qu'une fois (en hiragana) ci-dessus, la bascule katakana se fait ici.
const byHira = new Map(KANA.map((e) => [e.hira, e]))

interface Cell {
  char: string
  romaji: string
}

function buildRows(columns: ColumnDef[], vowelLabels: string[]) {
  return vowelLabels.map((label, vi) => ({
    label,
    cells: columns.map((col): Cell | null => {
      const hira = col.hira[vi]
      if (!hira) return null
      const entry = byHira.get(hira)!
      return { char: script.value === 'hiragana' ? entry.hira : entry.kata, romaji: entry.romaji }
    }),
  }))
}

const rows = computed(() => buildRows(COLUMNS, VOWEL_LABELS))
const yoonRows = computed(() => buildRows(YOON_COLUMNS, YOON_LABELS))

const gridStyle = `grid-template-columns: 1.5rem repeat(${COLUMNS.length}, 2.25rem)`
const yoonGridStyle = `grid-template-columns: 1.5rem repeat(${YOON_COLUMNS.length}, 2.25rem)`

// --- Mobile : le tableau large impose un défilement horizontal peu pratique
// sur téléphone. On y remet plutôt une consonne par ligne, groupée par
// famille (か→が, さ→ざ, た→だ, は→ば→ぱ), dérivée des mêmes COLUMNS /
// YOON_COLUMNS que le tableau desktop (pas de données dupliquées).
const FAMILY_GROUPS = [[0], [1, 2], [3, 4], [5, 6], [7], [8, 9, 10], [11], [12], [13], [14], [15]]
const YOON_FAMILY_GROUPS = [[0, 1], [2, 3], [4], [5], [6, 7, 8], [9], [10]]

function columnCells(col: ColumnDef): Cell[] {
  return col.hira
    .filter((h): h is string => !!h)
    .map((hira) => {
      const entry = byHira.get(hira)!
      return { char: script.value === 'hiragana' ? entry.hira : entry.kata, romaji: entry.romaji }
    })
}

function buildFamilyGroups(columns: ColumnDef[], groups: number[][]) {
  return groups.map((idxs) => idxs.map((i) => ({ label: columns[i]!.label, cells: columnCells(columns[i]!) })))
}

const mobileGroups = computed(() => buildFamilyGroups(COLUMNS, FAMILY_GROUPS))
const yoonMobileGroups = computed(() => buildFamilyGroups(YOON_COLUMNS, YOON_FAMILY_GROUPS))

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

    <!-- Mobile (< md) : une consonne par ligne, groupée par famille -->
    <div class="space-y-3 md:hidden">
      <div v-for="(group, gi) in mobileGroups" :key="gi" class="space-y-1.5">
        <div v-for="r in group" :key="r.label" class="flex items-center gap-1.5">
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
    </div>

    <div class="mt-4 mb-2 flex items-center gap-2 md:hidden">
      <span class="text-xs font-medium text-neutral-400">Combinaisons (ゃ ゅ ょ)</span>
      <div class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    </div>
    <div class="space-y-3 md:hidden">
      <div v-for="(group, gi) in yoonMobileGroups" :key="gi" class="space-y-1.5">
        <div v-for="r in group" :key="r.label" class="flex items-center gap-1.5">
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
    </div>

    <!-- Desktop (>= md) : tableau gojūon, consonnes en colonnes -->
    <div class="hidden overflow-x-auto pb-1 md:block">
      <div class="grid w-max gap-1" :style="gridStyle">
        <div />
        <span v-for="col in COLUMNS" :key="col.label" class="jp text-center text-xs text-neutral-400">{{ col.label }}</span>

        <template v-for="row in rows" :key="row.label">
          <span class="jp flex items-center justify-center text-xs text-neutral-400">{{ row.label }}</span>
          <template v-for="(cell, ci) in row.cells" :key="ci">
            <span
              v-if="cell"
              :title="`${cell.romaji} — ${cellTitle(cell.char)}`"
              class="jp flex h-9 w-9 items-center justify-center rounded-md text-lg"
              :class="cellClass(cell.char)"
            >
              {{ cell.char }}
            </span>
            <span v-else />
          </template>
        </template>
      </div>
    </div>

    <div class="mt-4 mb-2 hidden items-center gap-2 md:flex">
      <span class="text-xs font-medium text-neutral-400">Combinaisons (ゃ ゅ ょ)</span>
      <div class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    </div>
    <div class="hidden overflow-x-auto pb-1 md:block">
      <div class="grid w-max gap-1" :style="yoonGridStyle">
        <div />
        <span v-for="col in YOON_COLUMNS" :key="col.label" class="jp text-center text-xs text-neutral-400">{{ col.label }}</span>

        <template v-for="row in yoonRows" :key="row.label">
          <span class="jp flex items-center justify-center text-xs text-neutral-400">{{ row.label }}</span>
          <template v-for="(cell, ci) in row.cells" :key="ci">
            <span
              v-if="cell"
              :title="`${cell.romaji} — ${cellTitle(cell.char)}`"
              class="jp flex h-9 w-9 items-center justify-center rounded-md text-lg"
              :class="cellClass(cell.char)"
            >
              {{ cell.char }}
            </span>
            <span v-else />
          </template>
        </template>
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
