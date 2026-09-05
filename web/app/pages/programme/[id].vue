<script setup lang="ts">
import { computed } from 'vue'
import { PHASES } from '~/data/programme'
import { useLiveQuery } from '~/composables/useLiveQuery'
import { getCheckedCriteria, phaseCompletion, setCriterionChecked } from '~/lib/progress'

const route = useRoute()
const phase = computed(() => PHASES.find((p) => p.id === route.params.id))

useHead({ title: () => (phase.value ? `Phase ${phase.value.number} — ${phase.value.title}` : 'Programme') + ' — Japonais' })

const checked = useLiveQuery(() => getCheckedCriteria(), new Set<string>())
const completion = computed(() => (phase.value ? phaseCompletion(phase.value, checked.value) : null))

function toggle(id: string, isChecked: boolean) {
  setCriterionChecked(id, isChecked)
}
</script>

<template>
  <div v-if="phase">
    <NuxtLink
      to="/programme"
      class="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <AppIcon name="arrow-left" class="h-4 w-4" />
      Programme
    </NuxtLink>

    <PageHeader :title="`Phase ${phase.number} — ${phase.title}`" :subtitle="phase.summary" />

    <div class="mb-6 flex flex-wrap gap-2">
      <span v-if="phase.palier" class="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
        {{ phase.palier }}
      </span>
      <span v-if="phase.cecr" class="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
        CECR {{ phase.cecr }}
      </span>
      <span class="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
        {{ phase.duration }}
      </span>
    </div>

    <p v-if="phase.cumul" class="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
      <span class="font-medium text-neutral-700 dark:text-neutral-300">Cumul visé :</span> {{ phase.cumul }}
    </p>

    <div class="space-y-5">
      <section
        v-for="s in phase.sections"
        :key="s.title"
        class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 class="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">{{ s.title }}</h2>
        <p v-if="s.text" class="text-sm text-neutral-700 dark:text-neutral-300">{{ s.text }}</p>
        <ul v-else class="list-disc space-y-1.5 pl-4 text-sm text-neutral-700 dark:text-neutral-300">
          <li v-for="(item, i) in s.items" :key="i">{{ item }}</li>
        </ul>
      </section>

      <section
        v-if="phase.exitCriteria.length"
        class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Critères de sortie</h2>
          <span class="text-xs text-neutral-400">{{ completion?.done }} / {{ completion?.total }}</span>
        </div>
        <ul class="space-y-2.5">
          <li v-for="c in phase.exitCriteria" :key="c.id">
            <label class="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                class="mt-0.5 h-4 w-4 shrink-0 rounded accent-brand-500"
                :checked="checked.has(c.id)"
                @change="toggle(c.id, ($event.target as HTMLInputElement).checked)"
              />
              <span :class="checked.has(c.id) ? 'text-neutral-400 line-through' : 'text-neutral-700 dark:text-neutral-300'">
                {{ c.text }}
              </span>
            </label>
          </li>
        </ul>
      </section>
    </div>
  </div>

  <div v-else>
    <PageHeader title="Phase introuvable" />
    <NuxtLink
      to="/programme"
      class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <AppIcon name="arrow-left" class="h-4 w-4" />
      Programme
    </NuxtLink>
  </div>
</template>
