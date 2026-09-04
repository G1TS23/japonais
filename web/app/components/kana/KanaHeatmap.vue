<script setup lang="ts">
import { computed, ref } from 'vue'
import { KANA } from '~/data/kana'
import { useKanaStats } from '~/composables/useKanaStats'

const script = ref('hiragana')
const { byChar } = useKanaStats()

interface RowDef {
  label: string
  chars: string[]
}

// Groupes par famille de consonne : chaque ligne voisée (dakuten) / semi-voisée
// (handakuten) suit directement sa base, plutôt que d'être reléguée en bloc à
// part — か→が, さ→ざ, た→だ, は→ば→ぱ. Un groupe = un tableau de lignes
// affichées avec un peu moins d'espace entre elles qu'entre deux groupes.
const GROUPS: RowDef[][] = [
  [{ label: 'あ', chars: ['あ', 'い', 'う', 'え', 'お'] }],
  [
    { label: 'か', chars: ['か', 'き', 'く', 'け', 'こ'] },
    { label: 'が', chars: ['が', 'ぎ', 'ぐ', 'げ', 'ご'] },
  ],
  [
    { label: 'さ', chars: ['さ', 'し', 'す', 'せ', 'そ'] },
    { label: 'ざ', chars: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'] },
  ],
  [
    { label: 'た', chars: ['た', 'ち', 'つ', 'て', 'と'] },
    { label: 'だ', chars: ['だ', 'ぢ', 'づ', 'で', 'ど'] },
  ],
  [{ label: 'な', chars: ['な', 'に', 'ぬ', 'ね', 'の'] }],
  [
    { label: 'は', chars: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
    { label: 'ば', chars: ['ば', 'び', 'ぶ', 'べ', 'ぼ'] },
    { label: 'ぱ', chars: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'] },
  ],
  [{ label: 'ま', chars: ['ま', 'み', 'む', 'め', 'も'] }],
  [{ label: 'や', chars: ['や', 'ゆ', 'よ'] }],
  [{ label: 'ら', chars: ['ら', 'り', 'る', 'れ', 'ろ'] }],
  [{ label: 'わ', chars: ['わ', 'を'] }],
  [{ label: 'ん', chars: ['ん'] }],
]

// Même principe pour les combinaisons ゃゅょ : きゃ→ぎゃ, しゃ→じゃ, ひゃ→びゃ→ぴゃ.
const YOON_GROUPS: RowDef[][] = [
  [
    { label: 'きゃ', chars: ['きゃ', 'きゅ', 'きょ'] },
    { label: 'ぎゃ', chars: ['ぎゃ', 'ぎゅ', 'ぎょ'] },
  ],
  [
    { label: 'しゃ', chars: ['しゃ', 'しゅ', 'しょ'] },
    { label: 'じゃ', chars: ['じゃ', 'じゅ', 'じょ'] },
  ],
  [{ label: 'ちゃ', chars: ['ちゃ', 'ちゅ', 'ちょ'] }],
  [{ label: 'にゃ', chars: ['にゃ', 'にゅ', 'にょ'] }],
  [
    { label: 'ひゃ', chars: ['ひゃ', 'ひゅ', 'ひょ'] },
    { label: 'びゃ', chars: ['びゃ', 'びゅ', 'びょ'] },
    { label: 'ぴゃ', chars: ['ぴゃ', 'ぴゅ', 'ぴょ'] },
  ],
  [{ label: 'みゃ', chars: ['みゃ', 'みゅ', 'みょ'] }],
  [{ label: 'りゃ', chars: ['りゃ', 'りゅ', 'りょ'] }],
]

// hiragana -> entrée complète (kata, romaji…), pour n'écrire les caractères
// qu'une fois (ci-dessus, en hiragana) tout en supportant le bascule katakana.
const byHira = new Map(KANA.map((e) => [e.hira, e]))

function toCells(rows: RowDef[]) {
  return rows.map((r) => ({
    label: r.label,
    cells: r.chars.map((hira) => {
      const entry = byHira.get(hira)!
      return { char: script.value === 'hiragana' ? entry.hira : entry.kata, romaji: entry.romaji }
    }),
  }))
}

const groups = computed(() => GROUPS.map(toCells))
const yoonGroups = computed(() => YOON_GROUPS.map(toCells))

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

    <div class="space-y-3 overflow-x-auto">
      <div v-for="(group, gi) in groups" :key="gi" class="space-y-1.5">
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

    <div class="mt-4 mb-2 flex items-center gap-2">
      <span class="text-xs font-medium text-neutral-400">Combinaisons (ゃ ゅ ょ)</span>
      <div class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    </div>
    <div class="space-y-3 overflow-x-auto">
      <div v-for="(group, gi) in yoonGroups" :key="gi" class="space-y-1.5">
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

    <div class="mt-3 flex flex-wrap gap-3 text-xs text-neutral-400">
      <span class="flex items-center gap-1"><span class="h-3 w-3 rounded bg-neutral-200 dark:bg-neutral-700" /> jamais vu</span>
      <span class="flex items-center gap-1"><span class="h-3 w-3 rounded bg-red-300 dark:bg-red-800" /> &lt; 50 %</span>
      <span class="flex items-center gap-1"><span class="h-3 w-3 rounded bg-amber-300 dark:bg-amber-700" /> 50–80 %</span>
      <span class="flex items-center gap-1"><span class="h-3 w-3 rounded bg-green-300 dark:bg-green-800" /> ≥ 80 %</span>
    </div>
  </div>
</template>
