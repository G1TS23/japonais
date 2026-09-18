<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { findKanjiStrokes, KANJI_VIEWBOX } from '~/lib/kanji'

const props = withDefaults(defineProps<{ kanji: string; size?: number }>(), { size: 220 })

const entry = computed(() => findKanjiStrokes(props.kanji))
const strokes = computed(() => entry.value?.strokes ?? [])

/** Nombre de traits entièrement dessinés par l'animation. Vide par défaut :
 *  seul le repère pâle guide le tracé, l'animation est à la demande. */
const revealed = ref(0)
let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer() {
  if (timer) clearTimeout(timer)
  timer = null
}

/** Rejoue l'écriture trait par trait, depuis le début. */
function play() {
  clearTimer()
  revealed.value = 0
  const step = () => {
    if (revealed.value >= strokes.value.length) return
    revealed.value++
    timer = setTimeout(step, 550)
  }
  timer = setTimeout(step, 150)
}

// --- Canevas de tracé libre : entraînement à main levée, sans correction
// automatique (comparer un tracé libre au tracé de référence demanderait une
// reconnaissance de forme hors de portée ici — la valeur est dans la
// répétition du geste, pas dans une note).
const canvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false

function setupCanvas() {
  const el = canvasEl.value
  if (!el) return
  const dpr = window.devicePixelRatio || 1
  el.width = props.size * dpr
  el.height = props.size * dpr
  ctx = el.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#ef4444'
}

function clearCanvas() {
  if (!ctx || !canvasEl.value) return
  const dpr = window.devicePixelRatio || 1
  ctx.clearRect(0, 0, canvasEl.value.width / dpr, canvasEl.value.height / dpr)
}

function pointerPos(e: PointerEvent) {
  const rect = canvasEl.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onPointerDown(e: PointerEvent) {
  if (!ctx) return
  drawing = true
  const { x, y } = pointerPos(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
  canvasEl.value?.setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  if (!drawing || !ctx) return
  const { x, y } = pointerPos(e)
  ctx.lineTo(x, y)
  ctx.stroke()
}
function onPointerUp() {
  drawing = false
}

onMounted(setupCanvas)
watch(() => props.size, setupCanvas)
watch(
  () => props.kanji,
  () => {
    clearTimer()
    revealed.value = 0
    clearCanvas()
  },
)
onBeforeUnmount(clearTimer)
</script>

<template>
  <div v-if="entry" class="inline-flex flex-col items-center gap-3">
    <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg
        :viewBox="`0 0 ${KANJI_VIEWBOX} ${KANJI_VIEWBOX}`"
        class="absolute inset-0 h-full w-full rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <line
          :x1="KANJI_VIEWBOX / 2"
          y1="0"
          :x2="KANJI_VIEWBOX / 2"
          :y2="KANJI_VIEWBOX"
          stroke="currentColor"
          stroke-width="0.5"
          class="text-neutral-100 dark:text-neutral-800"
        />
        <line
          x1="0"
          :y1="KANJI_VIEWBOX / 2"
          :x2="KANJI_VIEWBOX"
          :y2="KANJI_VIEWBOX / 2"
          stroke="currentColor"
          stroke-width="0.5"
          class="text-neutral-100 dark:text-neutral-800"
        />

        <!-- Fond : le kanji complet, très pâle, toujours visible comme repère. -->
        <path
          v-for="(d, i) in strokes"
          :key="`ghost-${i}`"
          :d="d"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-neutral-200 dark:text-neutral-800"
        />

        <!-- Traits révélés, dessinés un par un via stroke-dashoffset (pathLength=1
             ramène l'unité de dasharray à la longueur totale du trait, quelle
             qu'elle soit). -->
        <path
          v-for="(d, i) in strokes"
          :key="`stroke-${i}`"
          :d="d"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-brand-500 transition-[stroke-dashoffset] duration-500 ease-linear"
          :style="{ strokeDasharray: 1, strokeDashoffset: i < revealed ? 0 : 1 }"
        />
      </svg>

      <canvas
        ref="canvasEl"
        class="absolute inset-0 h-full w-full cursor-crosshair touch-none"
        :style="{ width: `${size}px`, height: `${size}px` }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointerleave="onPointerUp"
      />
    </div>

    <p class="text-xs text-neutral-400">{{ strokes.length }} trait{{ strokes.length > 1 ? 's' : '' }} — dessine par-dessus pour t'entraîner.</p>

    <div class="flex flex-wrap justify-center gap-2">
      <button
        type="button"
        class="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
        @click="play"
      >
        Animer le tracé
      </button>
      <button
        type="button"
        class="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        @click="clearCanvas"
      >
        Effacer mon tracé
      </button>
    </div>
  </div>

  <p v-else class="text-sm text-neutral-400">Tracé indisponible pour « {{ kanji }} ».</p>
</template>
