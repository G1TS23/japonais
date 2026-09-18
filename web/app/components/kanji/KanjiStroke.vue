<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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

// --- Tracé libre : entraînement à main levée, en vectoriel (SVG, pas un
// <canvas> raster) pour un rendu net à toute résolution et cohérent avec le
// tracé de référence. Pas de correction automatique (comparer un tracé libre
// au tracé de référence demanderait une reconnaissance de forme hors de
// portée ici — la valeur est dans la répétition du geste, pas dans une note).
interface Point {
  x: number
  y: number
}

/** Un point par pointeur, en coordonnées du viewBox (0-109), pas en pixels écran. */
const userStrokes = ref<string[]>([])
let currentPoints: Point[] = []
const currentPath = ref('')
const svgEl = ref<SVGSVGElement | null>(null)
let drawing = false

/** Bézier quadratique passant par le milieu de chaque segment : lisse la polyligne brute des points captés sans dépendance externe. */
function smoothPath(points: Point[]): string {
  if (!points.length) return ''
  if (points.length === 1) return `M${points[0]!.x},${points[0]!.y}`
  let d = `M${points[0]!.x},${points[0]!.y}`
  for (let i = 1; i < points.length - 1; i++) {
    const curr = points[i]!
    const next = points[i + 1]!
    const midX = (curr.x + next.x) / 2
    const midY = (curr.y + next.y) / 2
    d += ` Q${curr.x},${curr.y} ${midX},${midY}`
  }
  const last = points[points.length - 1]!
  d += ` L${last.x},${last.y}`
  return d
}

function clearUserStrokes() {
  userStrokes.value = []
  currentPoints = []
  currentPath.value = ''
}

/** Efface à la fois mon tracé libre et le tracé animé (pour recommencer à blanc, même après « Animer »). */
function clearAll() {
  clearTimer()
  revealed.value = 0
  clearUserStrokes()
}

/** Retire le dernier trait tracé, sans toucher au tracé animé. */
function undoStroke() {
  userStrokes.value = userStrokes.value.slice(0, -1)
}

function pointerPos(e: PointerEvent): Point {
  const rect = svgEl.value!.getBoundingClientRect()
  const scale = KANJI_VIEWBOX / rect.width
  return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale }
}

function onPointerDown(e: PointerEvent) {
  drawing = true
  currentPoints = [pointerPos(e)]
  currentPath.value = smoothPath(currentPoints)
  svgEl.value?.setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  if (!drawing) return
  currentPoints.push(pointerPos(e))
  currentPath.value = smoothPath(currentPoints)
}
function onPointerUp() {
  if (!drawing) return
  drawing = false
  if (currentPath.value) userStrokes.value = [...userStrokes.value, currentPath.value]
  currentPoints = []
  currentPath.value = ''
}

watch(() => props.kanji, clearAll)
onBeforeUnmount(clearTimer)
</script>

<template>
  <div v-if="entry" class="inline-flex flex-col items-center gap-3">
    <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg
        ref="svgEl"
        :viewBox="`0 0 ${KANJI_VIEWBOX} ${KANJI_VIEWBOX}`"
        class="absolute inset-0 h-full w-full cursor-crosshair touch-none rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointerleave="onPointerUp"
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

        <!-- Mon tracé : chaque geste est un <path> lissé (Bézier quadratique par
             les milieux), pas des pixels — net à toute résolution. -->
        <path
          v-for="(d, i) in userStrokes"
          :key="`user-${i}`"
          :d="d"
          fill="none"
          stroke="#ef4444"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path v-if="currentPath" :d="currentPath" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
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
        class="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        :disabled="!userStrokes.length"
        @click="undoStroke"
      >
        Annuler le dernier trait
      </button>
      <button
        type="button"
        class="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        @click="clearAll"
      >
        Effacer
      </button>
    </div>
  </div>

  <p v-else class="text-sm text-neutral-400">Tracé indisponible pour « {{ kanji }} ».</p>
</template>
