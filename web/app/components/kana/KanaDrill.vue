<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { matchesRomaji } from '~/data/kana'
import { makeChoices, type Direction, type DrillItem, type DrillResult } from '~/lib/kana-session'
import { recordKanaAnswer } from '~/composables/useKanaStats'
import { useSpeech } from '~/composables/useSpeech'
import { useSettingsStore } from '~/stores/settings'

const props = defineProps<{
  items: DrillItem[]
  pool: DrillItem[]
  direction: Direction
}>()

const emit = defineEmits<{ finish: [result: DrillResult]; quit: [] }>()

const settings = useSettingsStore()
const speech = useSpeech()

function maybeAutoplay(text: string) {
  if (settings.values.audioEnabled && settings.values.audioAutoplay) speech.speak(text)
}

const index = ref(0)
const startedAt = Date.now()

const missed = ref<Set<string>>(new Set())
const firstSeen = ref<Set<string>>(new Set())
const firstTryCorrect = ref(0)

// Une session = exactement `items.length` questions. Les caractères ratés ne
// sont PAS réinsérés dans la file : ils sont proposés via « Rejouer les ratés »
// sur l'écran de résultats.
const current = computed<DrillItem | undefined>(() => props.items[index.value])
const total = props.items.length
const doneCount = computed(() => Math.min(firstSeen.value.size, total))

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
    // L'input reste le même élément DOM d'une carte à l'autre (pas de v-if par
    // carte) : le focus survit déjà en général. On le réaffirme quand même
    // ici en filet de sécurité (ex. premier montage).
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
  if (!ok) missed.value.add(item.char)
}

function advance() {
  if (index.value + 1 >= total) {
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
    // Le bouton vient de voler le focus au champ (comportement navigateur
    // normal) : on le reprend tout de suite, dans le même geste utilisateur,
    // sinon le clavier mobile refuse de se rouvrir après coup.
    inputEl.value?.focus()
    return
  }
  const ok = matchesRomaji(c.entry, answer.value)
  registerAttempt(c, ok)
  phase.value = ok ? 'correct' : 'wrong'
  maybeAutoplay(c.char)
  inputEl.value?.focus()
  if (ok) setTimeout(advance, 350)
}

function pick(choice: string) {
  const c = current.value
  if (!c || picked.value) return
  picked.value = choice
  const ok = choice === c.char
  registerAttempt(c, ok)
  maybeAutoplay(c.char)
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
      <div class="mb-1 text-xs text-neutral-500 dark:text-neutral-400">{{ doneCount }} / {{ total }}</div>
      <div class="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div class="h-full bg-brand-500 transition-all" :style="{ width: `${progressPct}%` }" />
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
            enterkeyhint="done"
            placeholder="rōmaji…"
            class="w-full rounded-lg border-2 bg-transparent px-4 py-3 text-center text-lg outline-none transition"
            :class="{
              'border-neutral-300 focus:border-brand-500 dark:border-neutral-700': phase === 'input',
              'border-green-500 text-green-600 dark:text-green-400': phase === 'correct',
              'border-red-500 text-red-600 dark:text-red-400': phase === 'wrong',
            }"
          />
        </form>
        <div class="flex min-h-6 items-center gap-2 text-sm">
          <span v-if="phase === 'wrong'" class="text-red-600 dark:text-red-400">
            Réponse : <strong>{{ current.romaji }}</strong>
          </span>
          <span v-else-if="phase === 'correct'" class="text-green-600 dark:text-green-400">Correct</span>
          <SpeakButton v-if="phase !== 'input'" :text="current.char" size="sm" :label="`Écouter ${current.char}`" />
        </div>
        <button
          class="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          @click="submitInput"
        >
          {{ phase === 'input' ? 'Valider' : 'Continuer' }}
        </button>
      </div>
      <button
        class="mt-3 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        @click="emit('quit')"
      >
        Quitter
      </button>
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
              'border-neutral-300 hover:border-brand-400 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/60': !picked,
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
        <div v-if="picked" class="flex w-full items-center gap-2">
          <SpeakButton :text="current.char" :label="`Écouter ${current.char}`" />
          <button
            class="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            @click="advance"
          >
            Continuer
          </button>
        </div>
      </div>
      <button
        class="mt-3 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        @click="emit('quit')"
      >
        Quitter
      </button>
    </template>
  </div>
</template>
