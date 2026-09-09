<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import type { IconName } from '~/components/AppIcon.vue'

const route = useRoute()

interface NavLink {
  to: string
  label: string
  short: string
  icon: IconName
}

// Navigation à deux niveaux. Premier niveau : les quatre grandes zones de
// l'appli. « Apprentissage » n'est pas une page mais un regroupement — on y
// entre par sa dernière section visitée, et une barre dédiée permet ensuite de
// passer d'une section à l'autre.
const learningLinks: NavLink[] = [
  { to: '/kana', label: 'Kana', short: 'Kana', icon: 'language' },
  { to: '/srs', label: 'SRS', short: 'SRS', icon: 'rectangle-stack' },
  { to: '/grammaire', label: 'Grammaire', short: 'Gram.', icon: 'book-open' },
  { to: '/quiz', label: 'Quiz', short: 'Quiz', icon: 'pencil-square' },
]

// Après « Apprentissage » dans la navigation. La racine « / » redirige vers
// l'apprentissage : le tableau de bord vit sur sa propre route.
const topLinks: NavLink[] = [
  { to: '/tableau-de-bord', label: 'Tableau de bord', short: 'Tableau', icon: 'chart-bar' },
  { to: '/programme', label: 'Programme', short: 'Prog.', icon: 'map' },
  { to: '/settings', label: 'Réglages', short: 'Régl.', icon: 'cog-6-tooth' },
]

// Barre latérale réduite à des icônes (avec bouton pour l'étendre à nouveau) :
// utile sur les fenêtres desktop plus étroites, où du contenu large (le
// tableau des kana notamment) réclame le maximum de place. Préférence
// mémorisée.
const collapsed = useStorage('nav-collapsed', false)

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

// --- Section « Apprentissage » -------------------------------------------
/** Dernière section d'apprentissage visitée : « Apprentissage » y ramène. */
const lastLearning = useStorage('nav-last-learning', '/srs')
const inLearning = computed(() => learningLinks.some((l) => isActive(l.to)))

watch(
  () => route.path,
  (path) => {
    const hit = learningLinks.find((l) => path.startsWith(l.to))
    if (hit) lastLearning.value = hit.to
  },
  { immediate: true },
)

// --- Tiroir latéral (mobile) ---------------------------------------------
const drawerOpen = ref(false)

watch(() => route.path, () => (drawerOpen.value = false))

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') drawerOpen.value = false
}
watch(drawerOpen, (open) => {
  if (open) window.addEventListener('keydown', onEsc)
  else window.removeEventListener('keydown', onEsc)
})
onUnmounted(() => window.removeEventListener('keydown', onEsc))
</script>

<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <a
      href="#content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      Aller au contenu
    </a>

    <!-- Barre supérieure (mobile uniquement) : fixée en haut. La hauteur inclut
         l'inset du haut (encoche) pour garder 3.5rem de barre visible dessous. -->
    <header
      class="fixed inset-x-0 top-0 z-40 flex min-h-[calc(3.5rem_+_env(safe-area-inset-top))] items-center gap-2 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/95"
      style="padding-top: env(safe-area-inset-top)"
    >
      <button
        type="button"
        aria-label="Ouvrir la navigation"
        :aria-expanded="drawerOpen"
        class="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        @click="drawerOpen = true"
      >
        <AppIcon name="bars-3" class="h-6 w-6" />
      </button>
      <span class="text-xl">🇯🇵</span>
      <span class="font-semibold tracking-tight">日本語</span>
    </header>

    <!-- Barre latérale (desktop uniquement) : ancrée au bord gauche du
         viewport (position fixed), indépendamment de la largeur de fenêtre —
         pas seulement "collée" dans la colonne centrée du contenu. -->
    <div
      class="fixed inset-y-0 left-0 z-30 hidden flex-col overflow-x-hidden border-r border-neutral-200 bg-neutral-50 py-10 transition-[width] duration-200 md:flex dark:border-neutral-800 dark:bg-neutral-950"
      :class="collapsed ? 'w-14 px-2' : 'w-52 px-4'"
      style="padding-top: calc(env(safe-area-inset-top) + 2.5rem)"
    >
      <div class="mb-4 flex items-center gap-2 px-1" :class="collapsed && 'justify-center'">
        <span class="text-2xl">🇯🇵</span>
        <span v-show="!collapsed" class="font-semibold tracking-tight whitespace-nowrap">日本語</span>
      </div>
      <nav aria-label="Navigation principale" class="flex flex-1 flex-col gap-1 overflow-y-auto">
        <!-- Groupe Apprentissage, en premier -->
        <div v-show="!collapsed" class="px-3 pb-1 text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
          Apprentissage
        </div>
        <NuxtLink
          v-for="l in learningLinks"
          :key="l.to"
          :to="l.to"
          :title="collapsed ? l.label : undefined"
          :aria-current="isActive(l.to) ? 'page' : undefined"
          class="flex items-center gap-2.5 rounded-lg py-2 text-sm font-medium transition"
          :class="[
            collapsed ? 'justify-center px-0' : 'px-3',
            isActive(l.to)
              ? 'bg-brand-500 text-white'
              : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100',
          ]"
        >
          <AppIcon :name="l.icon" :solid="isActive(l.to)" class="h-5 w-5 shrink-0" />
          <span v-show="!collapsed" class="whitespace-nowrap">{{ l.label }}</span>
        </NuxtLink>

        <div class="mx-2 my-2 border-t border-neutral-200 dark:border-neutral-800" />
        <NuxtLink
          v-for="l in topLinks"
          :key="l.to"
          :to="l.to"
          :title="collapsed ? l.label : undefined"
          :aria-current="isActive(l.to) ? 'page' : undefined"
          class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="[
            collapsed && 'justify-center px-0',
            isActive(l.to)
              ? 'bg-brand-500 text-white'
              : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100',
          ]"
        >
          <AppIcon :name="l.icon" :solid="isActive(l.to)" class="h-5 w-5 shrink-0" />
          <span v-show="!collapsed" class="whitespace-nowrap">{{ l.label }}</span>
        </NuxtLink>

        <button
          type="button"
          :title="collapsed ? 'Étendre la navigation' : 'Réduire la navigation'"
          :aria-label="collapsed ? 'Étendre la navigation' : 'Réduire la navigation'"
          :aria-pressed="!collapsed"
          class="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 transition hover:bg-neutral-200/60 hover:text-neutral-700 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-300"
          :class="collapsed && 'justify-center px-0'"
          @click="collapsed = !collapsed"
        >
          <AppIcon :name="collapsed ? 'chevron-double-right' : 'chevron-double-left'" class="h-5 w-5 shrink-0" />
          <span v-show="!collapsed" class="whitespace-nowrap">Réduire</span>
        </button>
      </nav>
    </div>

    <!-- Contenu : sur mobile, décalé sous le header (dont la hauteur inclut
         l'inset du haut) ; sur desktop, décalé de la largeur de la barre
         latérale et inséré du safe-area haut. -->
    <div
      class="mt-[calc(3.5rem_+_env(safe-area-inset-top))] transition-[margin] duration-200 md:mt-0 md:pt-[env(safe-area-inset-top)]"
      :class="collapsed ? 'md:ml-14' : 'md:ml-52'"
    >
      <main
        id="content"
        tabindex="-1"
        class="mx-auto max-w-5xl px-4 py-6 outline-none md:py-10"
        :class="
          inLearning
            ? 'pb-[calc(6rem_+_env(safe-area-inset-bottom))] md:pb-10'
            : 'pb-[calc(2rem_+_env(safe-area-inset-bottom))]'
        "
      >
        <slot />
      </main>
    </div>

    <!-- Barre de la section Apprentissage (mobile) : n'apparaît que dans la
         section, pour passer d'une activité à l'autre en un geste. -->
    <nav
      v-if="inLearning"
      aria-label="Sections d'apprentissage"
      class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-neutral-200 bg-white/95 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/95"
      :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.25rem)' }"
    >
      <NuxtLink
        v-for="l in learningLinks"
        :key="l.to"
        :to="l.to"
        :aria-current="isActive(l.to) ? 'page' : undefined"
        class="flex flex-col items-center gap-0.5 py-2 text-[10px] leading-none font-medium transition"
        :class="
          isActive(l.to)
            ? 'text-brand-600 dark:text-brand-400'
            : 'text-neutral-500 dark:text-neutral-400'
        "
      >
        <AppIcon :name="l.icon" :solid="isActive(l.to)" class="h-5 w-5" />
        <span class="max-w-full truncate px-0.5">{{ l.short }}</span>
      </NuxtLink>
    </nav>

    <!-- Tiroir de navigation (mobile) : ouvert par le bouton burger du header.
         Toujours monté (pour animer l'entrée ET la sortie), neutralisé par
         `inert` quand il est fermé. -->
    <div
      class="fixed inset-0 z-50 md:hidden"
      :class="drawerOpen || 'pointer-events-none'"
      :inert="!drawerOpen"
    >
      <div
        class="absolute inset-0 bg-black/40 transition-opacity duration-200 ease-out"
        :class="drawerOpen ? 'opacity-100' : 'opacity-0'"
        @click="drawerOpen = false"
      />
      <div
        class="absolute inset-y-0 left-0 flex w-64 max-w-[80%] flex-col border-r border-neutral-200 bg-white px-3 pb-4 transition-transform duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-950"
        :class="drawerOpen ? 'translate-x-0' : '-translate-x-full'"
        :style="{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }"
      >
          <div class="mb-4 flex items-center gap-2 px-2">
            <span class="text-2xl">🇯🇵</span>
            <span class="font-semibold tracking-tight">日本語</span>
            <button
              type="button"
              aria-label="Fermer la navigation"
              class="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
              @click="drawerOpen = false"
            >
              <AppIcon name="x-mark" class="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Navigation" class="flex flex-1 flex-col gap-1 overflow-y-auto">
            <!-- Regroupement, en premier : entre par la dernière section visitée. -->
            <NuxtLink
              :to="lastLearning"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
              :class="
                inLearning
                  ? 'bg-brand-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
              "
            >
              <AppIcon name="academic-cap" :solid="inLearning" class="h-5 w-5 shrink-0" />
              Apprentissage
            </NuxtLink>

            <div class="mx-2 my-1.5 border-t border-neutral-200 dark:border-neutral-800" />

            <NuxtLink
              v-for="l in topLinks"
              :key="l.to"
              :to="l.to"
              :aria-current="isActive(l.to) ? 'page' : undefined"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
              :class="
                isActive(l.to)
                  ? 'bg-brand-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
              "
            >
              <AppIcon :name="l.icon" :solid="isActive(l.to)" class="h-5 w-5 shrink-0" />
              {{ l.label }}
            </NuxtLink>
          </nav>
      </div>
    </div>
  </div>
</template>
