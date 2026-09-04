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
// utile sur les fenêtres desktop plus étroites, où le contenu large (ex. le
// tableau des kana) réclame le maximum de place. Préférence mémorisée.
const collapsed = useStorage('nav-collapsed', false)

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <!-- Barre supérieure (mobile uniquement) : fixée en haut -->
    <header
      class="fixed inset-x-0 top-0 z-40 flex min-h-14 items-center gap-2 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/95"
      style="padding-top: env(safe-area-inset-top)"
    >
      <span class="text-xl">🇯🇵</span>
      <span class="font-semibold tracking-tight">日本語</span>
    </header>

    <div
      class="mx-auto mt-14 flex max-w-5xl gap-6 px-4 py-6 md:mt-0 md:py-10"
      style="padding-top: env(safe-area-inset-top)"
    >
      <!-- Barre latérale (desktop uniquement) : logo + nav fixés ensemble -->
      <aside
        class="sticky top-10 hidden h-fit shrink-0 transition-[width] duration-200 md:block"
        :class="collapsed ? 'w-14' : 'w-52'"
      >
        <div class="mb-4 flex items-center gap-2 px-1" :class="collapsed && 'justify-center'">
          <span class="text-2xl">🇯🇵</span>
          <span v-show="!collapsed" class="font-semibold tracking-tight">日本語</span>
        </div>
        <nav class="flex flex-col gap-1">
          <NuxtLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            :title="collapsed ? l.label : undefined"
            class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition"
            :class="[
              collapsed && 'justify-center px-0',
              isActive(l.to)
                ? 'bg-brand-500 text-white'
                : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100',
            ]"
          >
            <AppIcon :name="l.icon" :solid="isActive(l.to)" class="h-5 w-5 shrink-0" />
            <span v-show="!collapsed">{{ l.label }}</span>
          </NuxtLink>

          <button
            type="button"
            :title="collapsed ? 'Étendre la navigation' : 'Réduire la navigation'"
            class="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 transition hover:bg-neutral-200/60 hover:text-neutral-700 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-300"
            :class="collapsed && 'justify-center px-0'"
            @click="collapsed = !collapsed"
          >
            <AppIcon :name="collapsed ? 'chevron-double-right' : 'chevron-double-left'" class="h-5 w-5 shrink-0" />
            <span v-show="!collapsed">Réduire</span>
          </button>
        </nav>
      </aside>

      <main class="min-w-0 flex-1 pb-24 md:pb-0">
        <slot />
      </main>
    </div>

    <!-- Barre de navigation basse (mobile uniquement) -->
    <nav
      class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-neutral-200 bg-white/95 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/95"
      style="padding-bottom: env(safe-area-inset-bottom)"
    >
      <NuxtLink
        v-for="l in links"
        :key="l.to"
        :to="l.to"
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
