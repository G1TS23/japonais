<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { IconName } from '~/components/AppIcon.vue'

const route = useRoute()

const links: { to: string; label: string; short: string; icon: IconName }[] = [
  { to: '/', label: 'Tableau de bord', short: 'Accueil', icon: 'home' },
  { to: '/kana', label: 'Kana', short: 'Kana', icon: 'language' },
  { to: '/srs', label: 'SRS', short: 'SRS', icon: 'rectangle-stack' },
  { to: '/programme', label: 'Programme', short: 'Prog.', icon: 'map' },
  { to: '/quiz', label: 'Quiz', short: 'Quiz', icon: 'pencil-square' },
  { to: '/settings', label: 'Réglages', short: 'Réglages', icon: 'cog-6-tooth' },
]

// Barre latérale réduite à des icônes (avec bouton pour l'étendre à nouveau) :
// utile sur les fenêtres desktop plus étroites, où du contenu large (le
// tableau des kana notamment) réclame le maximum de place. Préférence
// mémorisée.
const collapsed = useStorage('nav-collapsed', false)

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <a
      href="#content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      Aller au contenu
    </a>

    <!-- Barre supérieure (mobile uniquement) : fixée en haut -->
    <header
      class="fixed inset-x-0 top-0 z-40 flex min-h-14 items-center gap-2 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/95"
      style="padding-top: env(safe-area-inset-top)"
    >
      <span class="text-xl">🇯🇵</span>
      <span class="font-semibold tracking-tight">日本語</span>
    </header>

    <!-- Barre latérale (desktop uniquement) : ancrée au bord gauche du
         viewport (position fixed), indépendamment de la largeur de fenêtre —
         pas seulement "collée" dans la colonne centrée du contenu. -->
    <aside
      class="fixed inset-y-0 left-0 z-30 hidden flex-col overflow-x-hidden border-r border-neutral-200 bg-neutral-50 py-10 transition-[width] duration-200 md:flex dark:border-neutral-800 dark:bg-neutral-950"
      :class="collapsed ? 'w-14 px-2' : 'w-52 px-4'"
      style="padding-top: calc(env(safe-area-inset-top) + 2.5rem)"
    >
      <div class="mb-4 flex items-center gap-2 px-1" :class="collapsed && 'justify-center'">
        <span class="text-2xl">🇯🇵</span>
        <span v-show="!collapsed" class="font-semibold tracking-tight whitespace-nowrap">日本語</span>
      </div>
      <nav aria-label="Navigation principale" class="flex flex-1 flex-col gap-1 overflow-y-auto">
        <NuxtLink
          v-for="l in links"
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
    </aside>

    <!-- Contenu : décalé de la largeur de la barre latérale sur desktop -->
    <div
      class="mt-14 transition-[margin] duration-200 md:mt-0"
      :class="collapsed ? 'md:ml-14' : 'md:ml-52'"
      style="padding-top: env(safe-area-inset-top)"
    >
      <main id="content" tabindex="-1" class="mx-auto max-w-5xl px-4 py-6 pb-24 outline-none md:py-10">
        <slot />
      </main>
    </div>

    <!-- Barre de navigation basse (mobile uniquement) -->
    <nav
      aria-label="Navigation"
      class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-neutral-200 bg-white/95 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/95"
      style="padding-bottom: env(safe-area-inset-bottom)"
    >
      <NuxtLink
        v-for="l in links"
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
  </div>
</template>
