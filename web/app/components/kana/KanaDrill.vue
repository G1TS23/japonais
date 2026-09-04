<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { matchesRomaji } from '~/data/kana'
import { makeChoices, type Direction, type DrillItem, type DrillResult } from '~/lib/kana-session'
import { recordKanaAnswer } from '~/composables/useKanaStats'

const props = defineProps<{
  items: DrillItem[]
  pool: DrillItem[]
  direction: Direction
}>()

const emit = defineEmits<{ finish: [result: DrillResult]; quit: [] }>()

const queue = ref<DrillItem[]>(props.items.slice())
const index = ref(0)
const startedAt = Date.now()

const missed = ref<Set<string>>(new Set())
const requeued = ref<Set<string>>(new Set())
const firstSeen = ref<Set<string>>(new Set())
const firstTryCorrect = ref(0)

const current = computed<DrillItem | undefined>(() => queue.value[index.value])
const total = props.items.length
const doneCount = computed(() => Math.min(firstSeen.value.size, total))
const remaining = computed(() => queue.value.length - index.value)

// --- Saisie (kana -> rōmaji) ---------------------------------------------
const answer = ref('')
const phase = ref<'input' | 'correct' | 'wrong'>('input')
const inputEl = ref<HTMLInputElement | null>(null)

// --- QCM (rōmaji -> kana) ----------------------------------------------
const choices = ref<string[]>([])
const picked = ref<string | null>(null)

watch(
  current,
  (c) => {
    answer.value = ''
    phase.value = 'input'
    picked.value = null
    if (c && props.direction === 'romaji2kana') choices.value = makeChoices(c, props.pool)
    if (c && props.direction === 'kana2romaji') nextTick(() => inputEl.value?.focus())
  },
  { immediate: true },
)

function registerAttempt(item: DrillItem, ok: boolean) {
  recordKanaAnswer(item.char, item.type, ok)
  if (!firstSeen.value.has(item.id)) {
    firstSeen.value.add(item.id)
    if (ok) firstTryCorrect.value++
  }
  if (!ok) {
    missed.value.add(item.char)
    if (!requeued.value.has(item.id)) {
      requeued.value.add(item.id)
      queue.value.push(item)
    }
  }
}

function advance() {
  if (index.value + 1 >= queue.value.length) {
    emit('finish', {
      total,
      firstTryCorrect: firstTryCorrect.value,
      missed: [...missed.value],
      durationMs: Date.now() - startedAt,
    })
    return
  }
  index.value++
}

function submitInput() {
  const c = current.value
  if (!c) return
  if (phase.value !== 'input') {
    advance()
    return
  }
  const ok = matchesRomaji(c.entry, answer.value)
  registerAttempt(c, ok)
  phase.value = ok ? 'correct' : 'wrong'
  if (ok) setTimeout(advance, 350)
}

function pick(choice: string) {
  const c = current.value
  if (!c || picked.value) return
  picked.value = choice
  const ok = choice === c.char
  registerAttempt(c, ok)
  if (ok) setTimeout(advance, 400)
}

function onKey(e: KeyboardEvent) {
  if (props.direction === 'romaji2kana') {
    if (picked.value && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      advance()
      return
    }
    const n = Number(e.key)
    if (n >= 1 && n <= choices.value.length) pick(choices.value[n - 1]!)
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

const progressPct = computed(() => Math.round((doneCount.value / total) * 100))
</script>

<template>
  <div v-if="current" class="mx-auto max-w-md">
    <!-- Progression -->
    <div class="mb-6">
      <div class="mb-1 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>{{ doneCount }} / {{ total }}</span>
        <button class="hover:text-neutral-900 dark:hover:text-neutral-100" @click="emit('quit')">
          Quitter
        </button>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div class="h-full bg-brand-500 transition-all" :style="{ width: `${progressPct}%` }" />
      </div>
      <div v-if="remaining > total - doneCount" class="mt-1 text-right text-xs text-amber-500">
        +{{ remaining - (total - doneCount) }} à revoir
      </div>
    </div>

    <!-- kana -> rōmaji -->
    <template v-if="direction === 'kana2romaji'">
      <div class="flex flex-col items-center gap-6 rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div class="jp text-7xl select-none">{{ current.char }}</div>
        <form class="w-full" @submit.prevent="submitInput">
          <input
            ref="inputEl"
            v-model="answer"
            type="text"
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            :readonly="phase !== 'input'"
            placeholder="rōmaji…"
            class="w-full rounded-lg border-2 bg-transparent px-4 py-3 text-center text-lg outline-none transition"
            :class="{
              'border-neutral-300 focus:border-brand-500 dark:border-neutral-700': phase === 'input',
              'border-green-500 text-green-600 dark:text-green-400': phase === 'correct',
              'border-red-500 text-red-600 dark:text-red-400': phase === 'wrong',
            }"
          />
        </form>
        <div class="min-h-6 text-sm">
          <span v-if="phase === 'wrong'" class="text-red-600 dark:text-red-400">
            Réponse : <strong>{{ current.romaji }}</strong>
          </span>
          <span v-else-if="phase === 'correct'" class="text-green-600 dark:text-green-400">Correct</span>
        </div>
        <button
          class="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          @click="submitInput"
        >
          {{ phase === 'input' ? 'Valider' : 'Continuer' }}
        </button>
      </div>
    </template>

    <!-- rōmaji -> kana -->
    <template v-else>
      <div class="flex flex-col items-center gap-6 rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div class="text-4xl font-semibold tracking-wide select-none">{{ current.romaji }}</div>
        <div class="grid w-full grid-cols-2 gap-3">
          <button
            v-for="(ch, i) in choices"
            :key="ch"
            class="jp relative rounded-xl border-2 py-5 text-3xl transition"
            :class="{
              'border-neutral-300 hover:border-brand-400 dark:border-neutral-700': !picked,
              'border-green-500 bg-green-50 dark:bg-green-950/40': picked && ch === current.char,
              'border-red-500 bg-red-50 dark:bg-red-950/40': picked === ch && ch !== current.char,
              'border-neutral-200 opacity-50 dark:border-neutral-800': picked && picked !== ch && ch !== current.char,
            }"
            @click="pick(ch)"
          >
            <span class="absolute top-1 left-2 text-xs text-neutral-400">{{ i + 1 }}</span>
            {{ ch }}
          </button>
        </div>
        <button
          v-if="picked"
          class="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          @click="advance"
        >
          Continuer
        </button>
      </div>
    </template>
  </div>
</template>
