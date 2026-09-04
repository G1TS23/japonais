<script setup lang="ts">
const route = useRoute()

const links = [
  { to: '/', label: 'Tableau de bord', short: 'Accueil', icon: '📊' },
  { to: '/kana', label: 'Kana', short: 'Kana', icon: 'あ' },
  { to: '/srs', label: 'SRS', short: 'SRS', icon: '🃏' },
  { to: '/programme', label: 'Programme', short: 'Prog.', icon: '🗺️' },
  { to: '/quiz', label: 'Quiz', short: 'Quiz', icon: '✍️' },
  { to: '/settings', label: 'Réglages', short: 'Réglages', icon: '⚙️' },
]

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <!-- Barre supérieure (mobile uniquement) -->
    <header
      class="flex items-center gap-2 border-b border-neutral-200 px-4 py-3 md:hidden dark:border-neutral-800"
    >
      <span class="text-xl">🇯🇵</span>
      <span class="font-semibold tracking-tight">日本語</span>
    </header>

    <div class="mx-auto flex max-w-5xl gap-6 px-4 py-6 md:py-10">
      <!-- Barre latérale (desktop uniquement) -->
      <aside class="hidden w-52 shrink-0 md:block">
        <div class="mb-4 flex items-center gap-2 px-1">
          <span class="text-2xl">🇯🇵</span>
          <span class="font-semibold tracking-tight">日本語</span>
        </div>
        <nav class="sticky top-10 flex flex-col gap-1">
          <NuxtLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
            :class="
              isActive(l.to)
                ? 'bg-brand-500 text-white'
                : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100'
            "
          >
            <span class="w-5 text-center">{{ l.icon }}</span>
            <span>{{ l.label }}</span>
          </NuxtLink>
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
        <span class="text-lg leading-none">{{ l.icon }}</span>
        <span class="max-w-full truncate px-0.5">{{ l.short }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>
